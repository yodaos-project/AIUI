#!/bin/sh
set -eu

cd "$(dirname "$0")"
build_dir=$(mktemp -d)
trap 'rm -rf "$build_dir"' EXIT
tar -xzf quicknes-src.tar.gz -C "$build_dir"
src="$build_dir/nes_emu"

# The page displays QuickNES's returned mapper error. Omit its duplicate
# stderr diagnostic so the freestanding module has no WASI file imports.
sed '/fprintf(stderr, "Could not find mapper/d' "$src/Nes_Mapper.cpp" > "$build_dir/mapper.cpp"
mv "$build_dir/mapper.cpp" "$src/Nes_Mapper.cpp"

em++ -O3 -flto -DNDEBUG -std=c++17 -fno-exceptions -fno-rtti \
  -I "$src" bridge.cpp "$src"/*.cpp --no-entry \
  -sFILESYSTEM=0 -sMALLOC=emmalloc \
  -sEXPORTED_FUNCTIONS=_malloc,_load_rom,_reset,_run_frame,_video_buffer,_audio_buffer \
  -o "$build_dir/nes.wasm"
install -m 644 "$build_dir/nes.wasm" ../assets/nes.wasm
