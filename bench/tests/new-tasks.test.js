import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getTask } from '../src/schema.js';
import { prepare } from '../src/workspace.js';
import { grade } from '../src/grader.js';

const cases = [
  {
    "id": "020-counter-step",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"count\": 0}, act() { this.setData({ count: this.data.count + 3 }); } };\n</script>\n<page><view><text>{{count}}</text><button bindtap=\"act\">Step</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "021-decrement",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"count\": 5}, act() { this.setData({ count: this.data.count - 1 }); } };\n</script>\n<page><view><text>{{count}}</text><button bindtap=\"act\">Decrement</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "022-reset-score",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"score\": 9}, act() { this.setData({ score: 0 }); } };\n</script>\n<page><view><text>{{score}}</text><button bindtap=\"act\">Clear</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "023-toggle-light",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"lit\": false}, act() { this.setData({ lit: !this.data.lit }); } };\n</script>\n<page><view><text>{{lit}}</text><button bindtap=\"act\">Toggle Light</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "024-advance-level",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"level\": 1}, act() { this.setData({ level: this.data.level + 1 }); } };\n</script>\n<page><view><text>{{level}}</text><button bindtap=\"act\">Next Level</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "025-double-total",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"total\": 2}, act() { this.setData({ total: this.data.total * 2 }); } };\n</script>\n<page><view><text>{{total}}</text><button bindtap=\"act\">Double</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "026-cycle-page",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"page\": 1}, act() { this.setData({ page: this.data.page === 3 ? 1 : this.data.page + 1 }); } };\n</script>\n<page><view><text>{{page}}</text><button bindtap=\"act\">Next</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "027-append-dot",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"message\": \"A\"}, act() { this.setData({ message: this.data.message + '.' }); } };\n</script>\n<page><view><text>{{message}}</text><button bindtap=\"act\">Append</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "028-increment-badge",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"badge\": 0}, act() { this.setData({ badge: this.data.badge + 1 }); } };\n</script>\n<page><view><text>{{badge}}</text><text>{{title}}</text><button bindtap=\"act\">Earn</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "029-dismiss-alert",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"alert\": true}, act() { this.setData({ alert: false }); } };\n</script>\n<page><view><text>{{alert}}</text><text>{{title}}</text><button bindtap=\"act\">Dismiss</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "030-resume-timer",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"running\": false}, act() { this.setData({ running: true }); } };\n</script>\n<page><view><text>{{running}}</text><text>{{title}}</text><button bindtap=\"act\">Resume</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "031-increase-volume",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"volume\": 20}, act() { this.setData({ volume: this.data.volume + 10 }); } };\n</script>\n<page><view><text>{{volume}}</text><text>{{title}}</text><button bindtap=\"act\">Louder</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "032-cap-progress",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"progress\": 50}, act() { this.setData({ progress: Math.min(100, this.data.progress + 40) }); } };\n</script>\n<page><view><text>{{progress}}</text><text>{{title}}</text><button bindtap=\"act\">Advance</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "033-cycle-mode",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"mode\": \"auto\"}, act() { this.setData({ mode: this.data.mode === 'auto' ? 'manual' : 'auto' }); } };\n</script>\n<page><view><text>{{mode}}</text><text>{{title}}</text><button bindtap=\"act\">Change Mode</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "034-mark-read",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"unread\": 3}, act() { this.setData({ unread: 0 }); } };\n</script>\n<page><view><text>{{unread}}</text><text>{{title}}</text><button bindtap=\"act\">Mark Read</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "035-add-item",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"items\": 2}, act() { this.setData({ items: this.data.items + 1 }); } };\n</script>\n<page><view><text>{{items}}</text><text>{{title}}</text><button bindtap=\"act\">Add Item</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "036-subtract-credit",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"credits\": 10}, act() { this.setData({ credits: this.data.credits - 2 }); } };\n</script>\n<page><view><text>{{credits}}</text><text>{{title}}</text><button bindtap=\"act\">Spend</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "037-flip-muted",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"title\": \"Home\", \"muted\": false}, act() { this.setData({ muted: !this.data.muted }); } };\n</script>\n<page><view><text>{{muted}}</text><text>{{title}}</text><button bindtap=\"act\">Mute</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "038-broken-like",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"likes\": 0}, act() { this.setData({ likes: this.data.likes + 1 }); } };\n</script>\n<page><view><text>{{likes}}</text><button bindtap=\"act\">Like</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "039-broken-pause",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"paused\": false}, act() { this.setData({ paused: true }); } };\n</script>\n<page><view><text>{{paused}}</text><button bindtap=\"act\">Pause</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "040-broken-retry",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"attempts\": 0}, act() { this.setData({ attempts: this.data.attempts + 1 }); } };\n</script>\n<page><view><text>{{attempts}}</text><button bindtap=\"act\">Retry</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "041-broken-clear",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"errors\": 2}, act() { this.setData({ errors: 0 }); } };\n</script>\n<page><view><text>{{errors}}</text><button bindtap=\"act\">Clear</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "042-broken-zoom",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"zoom\": 1}, act() { this.setData({ zoom: this.data.zoom + 1 }); } };\n</script>\n<page><view><text>{{zoom}}</text><button bindtap=\"act\">Zoom</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "043-broken-select",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"selected\": false}, act() { this.setData({ selected: true }); } };\n</script>\n<page><view><text>{{selected}}</text><button bindtap=\"act\">Select</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "044-broken-skip",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"position\": 1}, act() { this.setData({ position: this.data.position + 2 }); } };\n</script>\n<page><view><text>{{position}}</text><button bindtap=\"act\">Skip</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "045-broken-unlock",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"locked\": true}, act() { this.setData({ locked: false }); } };\n</script>\n<page><view><text>{{locked}}</text><button bindtap=\"act\">Unlock</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "046-legacy-heart",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"hearts\": 0}, act() { this.setData({ hearts: this.data.hearts + 1 }); } };\n</script>\n<page><view><text>{{hearts}}</text><button bindtap=\"act\">Heart</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "047-legacy-next",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"track\": 1}, act() { this.setData({ track: this.data.track + 1 }); } };\n</script>\n<page><view><text>{{track}}</text><button bindtap=\"act\">Next Track</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "048-legacy-finish",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"finished\": false}, act() { this.setData({ finished: true }); } };\n</script>\n<page><view><text>{{finished}}</text><button bindtap=\"act\">Finish</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "049-no-dom-activate",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"active\": false}, act() { this.setData({ active: true }); } };\n</script>\n<page><view><text>{{active}}</text><button bindtap=\"act\">Activate</button></view></page>\n<style>.root { display: flex; }</style>\n"
  },
  {
    "id": "050-no-dom-refresh",
    "solution": "<script def>{\"navigationBarTitleText\":\"Home\"}</script>\n<script setup>\nexport default { data: {\"refreshes\": 0}, act() { this.setData({ refreshes: this.data.refreshes + 1 }); } };\n</script>\n<page><view><text>{{refreshes}}</text><button bindtap=\"act\">Refresh</button></view></page>\n<style>.root { display: flex; }</style>\n"
  }
];

for (const item of cases) {
  test(`${item.id}: initial, solved, and broken behavior`, async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), 'aiui-bench-new-'));
    const workspace = path.join(base, 'workspace');
    try {
      const task = await getTask(item.id);
      await prepare(task, workspace);
      assert.equal((await grade(task, workspace)).resolved, false);
      const source = path.join(workspace, 'pages/index/index.ink');
      await mkdir(path.dirname(source), { recursive: true });
      await writeFile(source, item.solution);
      const solved = await grade(task, workspace);
      assert.equal(solved.resolved, true, JSON.stringify(solved));
      await writeFile(source, item.solution.replace(/this\.setData\(\{[^;]+?\}\);/, 'this.setData({});'));
      const broken = await grade(task, workspace);
      assert.equal(broken.resolved, false);
      assert.ok(broken.required.passed < broken.required.total);
    } finally {
      await rm(base, { recursive: true, force: true });
    }
  });
}
