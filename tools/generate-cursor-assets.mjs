// Rebuild the small, original SVG cursor set used by WebWindows.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../assets/cursors/', import.meta.url);
const themes = {
  dreama: { fill: '#1769d8', stroke: '#f7fbff', accent: '#55b9ff', width: 2.2 },
  classic: { fill: '#141820', stroke: '#ffffff', accent: '#202c3b', width: 1.7 },
  soft: { fill: '#7463df', stroke: '#ffffff', accent: '#c79cff', width: 2.5 },
  'dark-pro': { fill: '#eef5ff', stroke: '#111827', accent: '#70b9ff', width: 2.1 },
  mono: { fill: '#151515', stroke: '#ffffff', accent: '#777777', width: 2 }
};
const states = {
  default: '<path d="M5 3v24l6-6 4 9 4-2-4-9 9-1z"/>',
  pointer: '<path d="M11 29 6 23V14a2 2 0 0 1 4 0v3V6a2 2 0 0 1 4 0v10-4a2 2 0 0 1 4 0v4-3a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v9l-4 5z"/>',
  text: '<path d="M11 4h10M16 4v24M11 28h10" fill="none"/><path d="M8 10v12M24 10v12" fill="none"/>',
  wait: '<circle cx="16" cy="16" r="11" fill="none"/><path d="M16 5v11l6 4" fill="none"/>',
  progress: '<path d="M5 3v24l6-6 4 9 4-2-4-9 9-1z"/><circle cx="25" cy="25" r="5" fill="none"/>',
  move: '<path d="M16 2v28M2 16h28M16 2l-4 5m4-5 4 5M16 30l-4-5m4 5 4-5M2 16l5-4m-5 4 5 4M30 16l-5-4m5 4-5 4" fill="none"/>',
  'not-allowed': '<circle cx="16" cy="16" r="12" fill="none"/><path d="M8 8l16 16" fill="none"/>',
  crosshair: '<path d="M16 2v28M2 16h28" fill="none"/><circle cx="16" cy="16" r="5" fill="none"/>',
  help: '<path d="M10 11a6 6 0 1 1 9 5c-2 1-3 2-3 5" fill="none"/><circle cx="16" cy="27" r="1.5"/>',
  'ew-resize': '<path d="M3 16h26M3 16l7-6m-7 6 7 6m19-6-7-6m7 6-7 6" fill="none"/>',
  'ns-resize': '<path d="M16 3v26M16 3l-6 7m6-7 6 7m-6 19-6-7m6 7 6-7" fill="none"/>',
  'nwse-resize': '<path d="M5 5l22 22M5 5l9 1M5 5l1 9m21 13-9-1m9 1-1-9" fill="none"/>',
  'nesw-resize': '<path d="M27 5 5 27M27 5l-9 1m9-1-1 9M5 27l9-1m-9 1 1-9" fill="none"/>'
};
for (const [name, theme] of Object.entries(themes)) {
  const directory = new URL(`${name}/`, root);
  await mkdir(directory, { recursive: true });
  for (const [state, shape] of Object.entries(states)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="${theme.fill}" stroke="${theme.stroke}" stroke-width="${theme.width}" stroke-linecap="round" stroke-linejoin="round">${shape}</g>${state === 'progress' ? `<circle cx="25" cy="25" r="2" fill="${theme.accent}"/>` : ''}</svg>\n`;
    await writeFile(new URL(`${state}.svg`, directory), svg);
  }
}
console.log(`Generated ${Object.keys(themes).length * Object.keys(states).length} cursor assets`);
