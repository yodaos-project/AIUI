// SPDX-License-Identifier: GPL-2.0-or-later
#include "Nes_Emu.h"
#include <cstdint>
#include <cstdlib>

namespace {
Nes_Emu nes;
constexpr int width = Nes_Emu::image_width;
constexpr int height = Nes_Emu::image_height;
uint8_t indexed[Nes_Emu::buffer_width * (height + 2)];
uint32_t rgba[width * height];
int16_t pcm[1024]; // More than one 60 Hz frame at 48 kHz.
}

extern "C" {
const char* load_rom(void* bytes, int size) {
    Mem_File_Reader reader(bytes, size);
    const char* error = nes.load_ines(reader);
    std::free(bytes); // QuickNES owns its copy of the cartridge now.
    if (error) return error;
    nes.set_pixels(indexed, Nes_Emu::buffer_width);
    return nes.set_sample_rate(48000);
}

void reset() { nes.reset(); }
const uint32_t* video_buffer() { return rgba; }
const int16_t* audio_buffer() { return pcm; }

int run_frame(int buttons, int skip_video) {
    if (skip_video) {
        if (nes.emulate_skip_frame(buttons)) return -1;
        return nes.read_samples(pcm, sizeof(pcm) / sizeof(pcm[0]));
    }
    if (nes.emulate_frame(buttons)) return -1;
    const auto& frame = nes.frame();
    uint32_t palette[Nes_Emu::max_palette_size];
    for (int i = 0; i < Nes_Emu::max_palette_size; ++i) {
        const auto& rgb = Nes_Emu::nes_colors[frame.palette[i]];
        palette[i] = 0xff000000u | (rgb.blue << 16) | (rgb.green << 8) | rgb.red;
    }
    for (int y = 0; y < height; ++y) {
        const auto* row = frame.pixels + y * frame.pitch;
        for (int x = 0; x < width; ++x) {
            rgba[y * width + x] = palette[row[x]];
        }
    }
    return nes.read_samples(pcm, sizeof(pcm) / sizeof(pcm[0]));
}
}
