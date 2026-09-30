#!/usr/bin/env node
/** Combine completed model reports into one GitHub Actions job summary. */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Escape model names in both Markdown tables and HTML disclosure labels. */
function displayModel(model) {
  return String(model).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '&#124;');
}

/** An incomplete cost estimate cannot be presented as a model average. */
function averageCost(summary) {
  const total = summary.cost?.estimatedUsd;
  return summary.total > 0 && summary.cost?.complete && Number.isFinite(total)
    ? `$${(total / summary.total).toFixed(6)}`
    : 'N/A';
}

/** Keep the standalone report's contents while avoiding repeated page titles. */
export function markdownActionSummary(reports) {
  if (reports.length === 0) {
    return '# AIUI Coding Benchmark\n\nNo benchmark reports were produced. Check the preceding steps.\n';
  }

  const rows = reports.map(({ summary }) => {
    const score = `${summary.resolved}/${summary.total} (${Math.round(summary.resolvedRate * 100)}%)`;
    return `| \`${displayModel(summary.model)}\` | ${score} | ${averageCost(summary)} |`;
  });
  const details = reports.flatMap(({ summary, report }) => [
    '<details>',
    `<summary>${displayModel(summary.model)} — ${summary.resolved}/${summary.total} resolved</summary>`,
    '',
    report.replace(/^# AIUI Coding Benchmark\s*\n/, '').trim(),
    '',
    '</details>',
    '',
  ]);

  return [
    '# AIUI Coding Benchmark',
    '',
    '| Model | Resolved | Avg. cost (USD / task) |',
    '| --- | ---: | ---: |',
    ...rows,
    '',
    'Average cost is the estimated total divided by all tasks for that model. It is N/A if any task lacks a cost estimate.',
    '',
    '## Details',
    '',
    ...details,
  ].join('\n');
}

/** Read only directories with both aggregate data and their saved report. */
async function readReports(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  const reports = [];
  for (const entry of entries.filter(item => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const modelDirectory = path.join(directory, entry.name);
    try {
      const [summary, report] = await Promise.all([
        readFile(path.join(modelDirectory, 'summary.json'), 'utf8'),
        readFile(path.join(modelDirectory, 'report.md'), 'utf8'),
      ]);
      reports.push({ summary: JSON.parse(summary), report });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return reports;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = path.resolve(process.argv[2] || 'bench/results/github-actions');
  process.stdout.write(markdownActionSummary(await readReports(directory)));
}
