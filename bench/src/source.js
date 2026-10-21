/** Resolve a logical Page entry without prescribing single- or multi-file authoring. */
import { readWorkspace } from './workspace.js';

/**
 * Read a source file, or compose a missing pages/*.ink entry from its complete
 * JSON/WXML/WXSS/JS form. An existing .ink always wins here: the validator still
 * rejects dual forms, empty files, and incomplete configurations.
 */
export async function readSource(workspace, relative) {
  try {
    return await readWorkspace(workspace, relative);
  } catch (error) {
    if (error.code !== 'ENOENT' || !/^pages\/.*\.ink$/.test(relative)) throw error;
  }
  const base = relative.slice(0, -4);
  const [definition, template, style, logic] = await Promise.all(
    ['json', 'wxml', 'wxss', 'js'].map(extension => readWorkspace(workspace, `${base}.${extension}`)),
  );
  JSON.parse(definition);
  return `<script def>${definition}</script>\n<script setup>${logic}</script>\n<page>${template}</page>\n<style>${style}</style>`;
}
