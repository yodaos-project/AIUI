import hashlib
import io
import json
import struct
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "audit_aix.py"
MIB = 1024 * 1024


def zip_bytes(entries):
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_STORED) as archive:
        for name, data in entries:
            archive.writestr(name, data)
    return output.getvalue()


def png_header(width, height):
    return b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" + struct.pack(">II", width, height)


class AuditAixTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.directory = Path(self.tmp.name)

    def run_audit(self, *arguments):
        return subprocess.run(
            [sys.executable, str(SCRIPT), *map(str, arguments)],
            capture_output=True,
            text=True,
            check=False,
        )

    def test_inventories_without_modifying_archive(self):
        image = png_header(1254, 1254)
        entries = [
            ("AGENTS.md", b"instructions"),
            ("docs/NOTICE.md", b"attribution"),
            ("docs/plan.md", b"development plan"),
            ("assets/logos.bak-2026/logo.png", image),
            ("assets/logo.png", image),
            ("assets/sprite.png", png_header(768, 96)),
            ("code/a.js", b"same content"),
            ("code/b.js", b"same content"),
            ("../unsafe", b"not extracted"),
        ]
        package = self.directory / "sample.aix"
        package.write_bytes(zip_bytes(entries))
        before = hashlib.sha256(package.read_bytes()).digest()

        result = self.run_audit(package, "--screen", "480x352")
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)["archives"][0]
        self.assertEqual(report["archive_bytes"], package.stat().st_size)
        self.assertEqual(report["entry_count"], len(entries))
        self.assertEqual(
            report["entry_compressed_bytes"] + report["archive_overhead_bytes"],
            report["archive_bytes"],
        )
        candidates = {item["path"] for item in report["release_cleanup_candidates"]}
        self.assertIn("docs/plan.md", candidates)
        self.assertIn("assets/logos.bak-2026/logo.png", candidates)
        self.assertNotIn("docs/NOTICE.md", candidates)
        self.assertNotIn("AGENTS.md", candidates)
        images = {item["path"]: item for item in report["images"]}
        self.assertEqual((images["assets/logo.png"]["width"], images["assets/logo.png"]["height"]), (1254, 1254))
        self.assertEqual((images["assets/sprite.png"]["width"], images["assets/sprite.png"]["height"]), (768, 96))
        self.assertTrue(images["assets/sprite.png"]["exceeds_viewport"])
        duplicate_paths = [set(group["paths"]) for group in report["duplicate_groups"]]
        self.assertIn({"code/a.js", "code/b.js"}, duplicate_paths)
        self.assertIn({"assets/logo.png", "assets/logos.bak-2026/logo.png"}, duplicate_paths)
        self.assertEqual(report["unsafe_entry_names"], ["../unsafe"])
        self.assertEqual(report["inspection_errors"], [])
        self.assertEqual(hashlib.sha256(package.read_bytes()).digest(), before)

    def test_size_limit_boundaries(self):
        overhead = len(zip_bytes([("x", b"")]))
        cases = [
            (MIB - 1, "within_recommended"),
            (MIB, "within_recommended"),
            (MIB + 1, "within_limit_above_recommended"),
            (2 * MIB, "within_limit_above_recommended"),
            (2 * MIB + 1, "over_required_limit"),
        ]
        paths = []
        for size, _ in cases:
            path = self.directory / str(size)
            path.write_bytes(zip_bytes([("x", bytes(size - overhead))]))
            self.assertEqual(path.stat().st_size, size)
            paths.append(path)

        result = self.run_audit(*paths)
        self.assertEqual(result.returncode, 0, result.stderr)
        for report, (size, expected) in zip(json.loads(result.stdout)["archives"], cases):
            self.assertEqual(report["size_status"], expected)
            self.assertEqual(report["bytes_over_required_limit"], max(0, size - 2 * MIB))
            self.assertEqual(report["bytes_over_recommended_target"], max(0, size - MIB))

    def test_hash_limit_and_invalid_archive(self):
        package = self.directory / "sample.aix"
        package.write_bytes(zip_bytes([("a", b"same"), ("b", b"same")]))
        result = self.run_audit(package, "--hash-limit-mib", "0")
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)["archives"][0]
        self.assertEqual(report["duplicate_groups"], [])
        self.assertEqual(set(report["duplicate_hash_skipped_paths"]), {"a", "b"})

        invalid = self.directory / "invalid.aix"
        invalid.write_bytes(b"not a ZIP")
        result = self.run_audit(package, invalid)
        self.assertEqual(result.returncode, 1)
        self.assertIn("error", json.loads(result.stdout)["archives"][1])
        self.assertEqual(self.run_audit(package, "--screen", "0x352").returncode, 2)

    def test_unsupported_compression_is_reported(self):
        package = self.directory / "unsupported.aix"
        data = bytearray(zip_bytes([("image.png", png_header(10, 10))]))
        local = data.index(b"PK\x03\x04")
        central = data.index(b"PK\x01\x02")
        struct.pack_into("<H", data, local + 8, 99)
        struct.pack_into("<H", data, central + 10, 99)
        package.write_bytes(data)

        result = self.run_audit(package)
        self.assertEqual(result.returncode, 1)
        errors = json.loads(result.stdout)["archives"][0]["inspection_errors"]
        self.assertEqual(errors[0]["operation"], "image_header")


if __name__ == "__main__":
    unittest.main()
