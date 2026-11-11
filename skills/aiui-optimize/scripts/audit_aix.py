#!/usr/bin/env python3
"""Inspect local AIX/ZIP archives without extracting or modifying them."""

import argparse
import hashlib
import json
import os
import re
import struct
import sys
import zipfile
from collections import Counter, defaultdict
from pathlib import PurePosixPath


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
REQUIRED_LIMIT_BYTES = 2 * 1024 * 1024
RECOMMENDED_TARGET_BYTES = 1024 * 1024
AUDIO_EXTENSIONS = {".wav", ".mp3", ".ogg", ".m4a", ".aac", ".flac", ".opus"}
CODE_EXTENSIONS = {".js", ".mjs", ".cjs", ".ts", ".ink", ".css", ".html", ".json", ".xml", ".wasm"}
DOC_EXTENSIONS = {".md", ".txt", ".doc", ".docx", ".pdf", ".log"}
DEVELOPMENT_DIRS = {
    ".agents", ".claude", ".workbuddy", ".qoder", ".cache", "_gen",
    "doc", "docs", "preview", "previews", "screenshot", "screenshots",
    "test", "tests", "__tests__",
}


def category(name):
    ext = PurePosixPath(name.lower()).suffix
    if ext == ".aix":
        return "nested_aix"
    if ext in IMAGE_EXTENSIONS or ext in {".svg", ".bmp", ".avif"}:
        return "image"
    if ext in AUDIO_EXTENSIONS:
        return "audio"
    if ext in {".mp4", ".webm", ".mov", ".m4v"}:
        return "video"
    if ext == ".lottie":
        return "lottie"
    if ext in {".ttf", ".otf", ".woff", ".woff2"}:
        return "font"
    if ext in CODE_EXTENSIONS:
        return "code_data"
    if ext in DOC_EXTENSIONS:
        return "document_text_log"
    return "other"


def candidate_reason(name):
    """Return a reason to investigate, never a deletion decision."""
    parts = PurePosixPath(name.lower()).parts
    if not parts:
        return None
    basename = parts[-1]
    if basename in {"agents.md", "license", "license.txt", "license.md", "notice", "notice.txt", "notice.md"}:
        return None
    if any(p in DEVELOPMENT_DIRS for p in parts[:-1]):
        return "development, cache, test, or preview directory"
    if any(".bak" in p or p.startswith("backup") for p in parts[:-1]):
        return "backup directory"
    if basename.endswith(".aix"):
        return "nested package"
    if ".backup." in basename or basename.endswith((".bak", ".backup")):
        return "backup file"
    if re.fullmatch(r"log\d*\.(txt|log)", basename) or basename.endswith(".log"):
        return "log file"
    return None


def image_dimensions(stream, name):
    """Read dimensions for common raster headers; unsupported images return None."""
    ext = PurePosixPath(name.lower()).suffix
    if ext == ".png":
        header = stream.read(24)
        if len(header) == 24 and header[:8] == b"\x89PNG\r\n\x1a\n" and header[12:16] == b"IHDR":
            return struct.unpack(">II", header[16:24])
    elif ext == ".gif":
        header = stream.read(10)
        if len(header) == 10 and header[:6] in (b"GIF87a", b"GIF89a"):
            return struct.unpack("<HH", header[6:10])
    elif ext in {".jpg", ".jpeg"}:
        if stream.read(2) != b"\xff\xd8":
            return None
        # JPEG dimensions are in a Start of Frame segment, before image data.
        while True:
            byte = stream.read(1)
            if not byte:
                return None
            if byte != b"\xff":
                continue
            marker = stream.read(1)
            while marker == b"\xff":
                marker = stream.read(1)
            if not marker or marker in (b"\xd9", b"\xda"):
                return None
            code = marker[0]
            if code in (0x00, 0x01, 0xD8) or 0xD0 <= code <= 0xD7:
                continue
            raw_length = stream.read(2)
            if len(raw_length) != 2:
                return None
            length = struct.unpack(">H", raw_length)[0]
            if length < 2:
                return None
            if 0xC0 <= code <= 0xCF and code not in (0xC4, 0xC8, 0xCC):
                data = stream.read(5)
                if len(data) != 5 or length < 7:
                    return None
                height, width = struct.unpack(">HH", data[1:5])
                return width, height
            if len(stream.read(length - 2)) != length - 2:
                return None
    elif ext == ".webp":
        data = stream.read(30)
        if len(data) >= 25 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
            if data[12:16] == b"VP8X" and len(data) >= 30:
                return 1 + int.from_bytes(data[24:27], "little"), 1 + int.from_bytes(data[27:30], "little")
            if data[12:16] == b"VP8L" and data[20] == 0x2F:
                bits = int.from_bytes(data[21:25], "little")
                return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
            if data[12:16] == b"VP8 " and len(data) >= 30 and data[23:26] == b"\x9d\x01\x2a":
                width, height = struct.unpack("<HH", data[26:30])
                return width & 0x3FFF, height & 0x3FFF
    return None


def digest_entry(archive, entry):
    digest = hashlib.sha256()
    with archive.open(entry) as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def inspect_archive(path, screen, top, hash_limit):
    archive_bytes = os.path.getsize(path)
    if archive_bytes > REQUIRED_LIMIT_BYTES:
        size_status = "over_required_limit"
    elif archive_bytes > RECOMMENDED_TARGET_BYTES:
        size_status = "within_limit_above_recommended"
    else:
        size_status = "within_recommended"
    result = {
        "path": os.fspath(path),
        "archive_bytes": archive_bytes,
        "required_limit_bytes": REQUIRED_LIMIT_BYTES,
        "recommended_target_bytes": RECOMMENDED_TARGET_BYTES,
        "size_status": size_status,
        "bytes_over_required_limit": max(0, archive_bytes - REQUIRED_LIMIT_BYTES),
        "bytes_over_recommended_target": max(0, archive_bytes - RECOMMENDED_TARGET_BYTES),
        "reference_viewport": list(screen) if screen else None,
        "note": "Candidates and viewport comparisons require usage review; duplicate savings overlap other changes.",
    }
    with zipfile.ZipFile(path) as archive:
        entries = [entry for entry in archive.infolist() if not entry.is_dir()]
        categories = defaultdict(lambda: {"count": 0, "compressed_bytes": 0, "uncompressed_bytes": 0})
        candidates, images, errors = [], [], []
        by_size = defaultdict(list)
        unsafe_names = []
        for entry in entries:
            item = {"path": entry.filename, "compressed_bytes": entry.compress_size, "uncompressed_bytes": entry.file_size}
            group = categories[category(entry.filename)]
            group["count"] += 1
            group["compressed_bytes"] += entry.compress_size
            group["uncompressed_bytes"] += entry.file_size
            parts = PurePosixPath(entry.filename).parts
            if entry.filename.startswith("/") or ".." in parts or "\\" in entry.filename:
                unsafe_names.append(entry.filename)
            reason = candidate_reason(entry.filename)
            if reason:
                candidates.append({**item, "reason": reason})
            if entry.file_size:
                by_size[entry.file_size].append(entry)
            if PurePosixPath(entry.filename.lower()).suffix in IMAGE_EXTENSIONS:
                try:
                    with archive.open(entry) as stream:
                        dimensions = image_dimensions(stream, entry.filename)
                    image = {**item, "width": dimensions[0] if dimensions else None, "height": dimensions[1] if dimensions else None}
                    if dimensions and screen:
                        image["exceeds_viewport"] = dimensions[0] > screen[0] or dimensions[1] > screen[1]
                    images.append(image)
                except (OSError, RuntimeError, EOFError, NotImplementedError, zipfile.BadZipFile) as exc:
                    errors.append({"path": entry.filename, "operation": "image_header", "error": str(exc)})

        duplicate_groups, skipped = [], []
        for size, same_size in by_size.items():
            if len(same_size) < 2:
                continue
            if size > hash_limit:
                skipped.extend(entry.filename for entry in same_size)
                continue
            hashes = defaultdict(list)
            for entry in same_size:
                try:
                    hashes[digest_entry(archive, entry)].append(entry)
                except (OSError, RuntimeError, EOFError, NotImplementedError, zipfile.BadZipFile) as exc:
                    errors.append({"path": entry.filename, "operation": "duplicate_hash", "error": str(exc)})
            for digest, matches in hashes.items():
                if len(matches) > 1:
                    sizes = [entry.compress_size for entry in matches]
                    duplicate_groups.append({
                        "sha256": digest, "uncompressed_bytes_each": size,
                        "paths": [entry.filename for entry in matches],
                        "possible_redundant_compressed_bytes": sum(sizes) - min(sizes),
                    })

        compressed = sum(entry.compress_size for entry in entries)
        result.update({
            "entry_count": len(entries),
            "entry_compressed_bytes": compressed,
            "entry_uncompressed_bytes": sum(entry.file_size for entry in entries),
            "archive_overhead_bytes": result["archive_bytes"] - compressed,
            "categories": dict(sorted(categories.items(), key=lambda item: -item[1]["compressed_bytes"])),
            "largest_entries": sorted(
                ({"path": e.filename, "compressed_bytes": e.compress_size, "uncompressed_bytes": e.file_size} for e in entries),
                key=lambda item: -item["compressed_bytes"],
            )[:top],
            "release_cleanup_candidates": sorted(candidates, key=lambda item: -item["compressed_bytes"]),
            "candidate_compressed_bytes": sum(item["compressed_bytes"] for item in candidates),
            "images": sorted(images, key=lambda item: -item["compressed_bytes"]),
            "duplicate_groups": sorted(duplicate_groups, key=lambda item: -item["possible_redundant_compressed_bytes"]),
            "duplicate_hash_limit_bytes": hash_limit,
            "duplicate_hash_skipped_paths": skipped,
            "unsafe_entry_names": unsafe_names,
            "duplicate_entry_names": [name for name, count in Counter(e.filename for e in entries).items() if count > 1],
            "inspection_errors": errors,
        })
    return result


def screen_size(value):
    match = re.fullmatch(r"([1-9]\d*)[xX]([1-9]\d*)", value)
    if not match:
        raise argparse.ArgumentTypeError("viewport must have the form WIDTHxHEIGHT, e.g. 480x352")
    return int(match.group(1)), int(match.group(2))


def nonnegative_int(value):
    try:
        number = int(value)
        if number >= 0:
            return number
    except ValueError:
        pass
    raise argparse.ArgumentTypeError("must be a non-negative integer")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archives", nargs="+", help="local .aix or ZIP paths")
    parser.add_argument("--screen", type=screen_size, help="optional reference viewport, e.g. 480x352")
    parser.add_argument("--top", type=nonnegative_int, default=20, help="number of largest entries to return per archive")
    parser.add_argument("--hash-limit-mib", type=nonnegative_int, default=64, help="maximum duplicate candidate file size to hash")
    args = parser.parse_args()
    results, failed = [], False
    for path in args.archives:
        try:
            result = inspect_archive(path, args.screen, args.top, args.hash_limit_mib * 1024 * 1024)
            failed = failed or bool(result["inspection_errors"])
            results.append(result)
        except (OSError, ValueError, zipfile.BadZipFile, zipfile.LargeZipFile) as exc:
            failed = True
            results.append({"path": path, "error": str(exc)})
    json.dump({"archives": results}, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
