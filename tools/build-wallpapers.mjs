#!/usr/bin/env node
/**
 * WebWindows wallpaper generator.
 *
 * Reads assets/icons/logo_large.png, composes a set of 3840x2160 SVG
 * wallpapers that pair the logo with the "WebWindows" wordmark, then renders
 * each one to PNG with headless Chrome.
 *
 *   node tools/build-wallpapers.mjs
 *   node tools/build-wallpapers.mjs --only=02          # single variant
 *   node tools/build-wallpapers.mjs --no-png           # SVG sources only
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'wallpapers');
const srcDir = path.join(outDir, 'source');
const logoPath = path.join(root, 'assets', 'icons', 'logo_large.png');

const WIDTH = 3840;
const HEIGHT = 2160;

const LOGO_DATA_URI = `data:image/png;base64,${readFileSync(logoPath).toString('base64')}`;

const CHROME_CANDIDATES = [
  process.env.WEBWINDOWS_CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

const FONT_STACK = `'Segoe UI Variable Display','Segoe UI','Helvetica Neue',Arial,sans-serif`;

/* ---------------------------------------------------------------- helpers */

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Grain tile: turbulence is computed once for 256x256 then repeated. */
function grainDefs() {
  return `
    <filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="2" seed="11" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="mono"/>
      <feComponentTransfer in="mono">
        <feFuncR type="linear" slope="0.22" intercept="0.36"/>
        <feFuncG type="linear" slope="0.22" intercept="0.36"/>
        <feFuncB type="linear" slope="0.22" intercept="0.36"/>
      </feComponentTransfer>
    </filter>
    <pattern id="grainTile" width="256" height="256" patternUnits="userSpaceOnUse">
      <rect width="256" height="256" filter="url(#grain)"/>
    </pattern>`;
}

function glowDefs() {
  return `
    <filter id="halo" x="-70%" y="-70%" width="240%" height="240%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="46"/>
    </filter>
    <filter id="haloSoft" x="-70%" y="-70%" width="240%" height="240%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="130"/>
    </filter>
    <filter id="textGlow" x="-30%" y="-80%" width="160%" height="260%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="22"/>
    </filter>
    <filter id="logoLift" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="0" stdDeviation="26" flood-color="#5b7cff" flood-opacity="0.55"/>
      <feDropShadow dx="0" dy="26" stdDeviation="46" flood-color="#0a0f2e" flood-opacity="0.7"/>
    </filter>`;
}

/** Logo image sized by its natural 350x296 aspect ratio. */
function logo({ width, x, y, opacity = 1, lift = true, halo = 0 }) {
  const height = Math.round((width * 296) / 350);
  const haloLayer = halo
    ? `<ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width * 0.72}" ry="${height * 0.82}"
         fill="#4c6bff" opacity="${halo}" filter="url(#halo)"/>`
    : '';
  return `
    ${haloLayer}
    <image href="${LOGO_DATA_URI}" x="${x}" y="${y}" width="${width}" height="${height}"
           opacity="${opacity}"${lift ? ' filter="url(#logoLift)"' : ''} preserveAspectRatio="xMidYMid meet"/>`;
}

/** Wordmark with a soft coloured bloom behind the crisp white glyphs. */
function wordmark({ x, y, size, tracking = 22, anchor = 'middle', weight = 300, glowColor = '#3f5cff' }) {
  return `
    <text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT_STACK}" font-size="${size}"
          font-weight="${weight}" letter-spacing="${tracking}" fill="${glowColor}" opacity="0.75"
          filter="url(#textGlow)">WebWindows</text>
    <text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT_STACK}" font-size="${size}"
          font-weight="${weight}" letter-spacing="${tracking}" fill="url(#wordInk)">WebWindows</text>`;
}

function rule({ x, y, width, opacity = 0.5 }) {
  return `<rect x="${x}" y="${y}" width="${width}" height="2" fill="url(#ruleInk)" opacity="${opacity}"/>`;
}

function caption({ x, y, size = 46, tracking = 14, anchor = 'middle', opacity = 0.72, text }) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT_STACK}" font-size="${size}"
    font-weight="400" letter-spacing="${tracking}" fill="#aebbe6" opacity="${opacity}">${esc(text)}</text>`;
}

function grainLayer(opacity = 0.16) {
  return `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grainTile)" opacity="${opacity}"
    style="mix-blend-mode:overlay" pointer-events="none"/>`;
}

/** Vignette drawn last so it darkens the outer edges of every layout. */
function vignette(strong = 0.55) {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)" opacity="${strong}"/>`;
}

function commonDefs(bodyBackground) {
  return `
    <defs>
      <linearGradient id="wordInk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="0.55" stop-color="#e6ecff"/>
        <stop offset="1" stop-color="#b9c6f5"/>
      </linearGradient>
      <linearGradient id="ruleInk" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#4f6dff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#8ea4ff" stop-opacity="1"/>
        <stop offset="1" stop-color="#a855f7" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="vignette" cx="0.5" cy="0.46" r="0.78">
        <stop offset="0.45" stop-color="#000000" stop-opacity="0"/>
        <stop offset="0.8" stop-color="#01030d" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#01030d" stop-opacity="0.95"/>
      </radialGradient>
      ${bodyBackground}
      ${glowDefs()}
      ${grainDefs()}
    </defs>`;
}

function svgDocument(defs, body, background) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <title>WebWindows wallpaper</title>
  ${defs}
  ${background}
  ${body}
</svg>`;
}

/* --------------------------------------------------------------- variants */

const variants = [
  {
    id: '01',
    slug: 'centered-halo',
    label: 'Centered logo with a single wide halo',
    build: () => {
      const background = `
        <rect width="${WIDTH}" height="${HEIGHT}" fill="#04071a"/>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgCenter)"/>
        <ellipse cx="1920" cy="1010" rx="1500" ry="880" fill="#3b5bff" opacity="0.30" filter="url(#haloSoft)"/>
        <ellipse cx="1180" cy="1560" rx="980" ry="600" fill="#7c3aed" opacity="0.28" filter="url(#haloSoft)"/>
        <ellipse cx="2820" cy="620" rx="820" ry="520" fill="#2563eb" opacity="0.26" filter="url(#haloSoft)"/>
        <ellipse cx="1920" cy="980" rx="560" ry="420" fill="#8b5cf6" opacity="0.20" filter="url(#halo)"/>
        <path d="M0 1560 C 900 1420, 1420 1760, 2260 1640 C 2960 1540, 3400 1300, 3840 1360 L3840 2160 L0 2160 Z"
              fill="url(#floorGlow)" opacity="0.55"/>`;

      const defs = commonDefs(`
        <radialGradient id="bgCenter" cx="0.5" cy="0.44" r="0.78">
          <stop offset="0" stop-color="#152a72"/>
          <stop offset="0.42" stop-color="#0b1444"/>
          <stop offset="0.75" stop-color="#060a26"/>
          <stop offset="1" stop-color="#03050f"/>
        </radialGradient>
        <linearGradient id="floorGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2b3f9e" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#050818" stop-opacity="0"/>
        </linearGradient>`);

      const body = `
        ${logo({ width: 620, x: 1610, y: 660, halo: 0.22 })}
        ${wordmark({ x: 1920, y: 1500, size: 196, tracking: 30 })}
        ${rule({ x: 1420, y: 1570, width: 1000 })}
        ${caption({ x: 1920, y: 1668, text: 'A smarter desktop for the web' })}
        ${grainLayer(0.18)}
        ${vignette(0.6)}`;

      return svgDocument(defs, body, background);
    },
  },
  {
    id: '02',
    slug: 'left-lockup',
    label: 'Left-aligned lockup, text beside the logo',
    build: () => {
      const background = `
        <rect width="${WIDTH}" height="${HEIGHT}" fill="#05081c"/>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgDiag)"/>
        <ellipse cx="1180" cy="1080" rx="1250" ry="820" fill="#4361ff" opacity="0.24" filter="url(#haloSoft)"/>
        <ellipse cx="900" cy="1560" rx="900" ry="520" fill="#a855f7" opacity="0.20" filter="url(#haloSoft)"/>
        <ellipse cx="3240" cy="420" rx="1000" ry="640" fill="#1d4ed8" opacity="0.24" filter="url(#haloSoft)"/>
        <g stroke="#8ea4ff" stroke-opacity="0.10" fill="none">
          <circle cx="3060" cy="1160" r="360"/>
          <circle cx="3060" cy="1160" r="520" stroke-opacity="0.06"/>
          <circle cx="3060" cy="1160" r="700" stroke-opacity="0.04"/>
        </g>`;

      const defs = commonDefs(`
        <linearGradient id="bgDiag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0d1a52"/>
          <stop offset="0.5" stop-color="#080e30"/>
          <stop offset="1" stop-color="#04060f"/>
        </linearGradient>`);

      const body = `
        ${logo({ width: 470, x: 340, y: 720, halo: 0.22 })}
        <line x1="1010" y1="700" x2="1010" y2="1290" stroke="url(#ruleInk)" stroke-width="2" opacity="0.5"/>
        <text x="1114" y="1010" text-anchor="start" font-family="${FONT_STACK}" font-size="176"
              font-weight="300" letter-spacing="16" fill="#4f6dff" opacity="0.8"
              filter="url(#textGlow)">WebWindows</text>
        <text x="1110" y="1010" text-anchor="start" font-family="${FONT_STACK}" font-size="176"
              font-weight="300" letter-spacing="16" fill="url(#wordInk)">WebWindows</text>
        ${rule({ x: 1112, y: 1080, width: 900 })}
        ${caption({ x: 1112, y: 1176, size: 44, anchor: 'start', text: 'Cloud  ·  Desktop  ·  Intelligence' })}
        <g fill="none" stroke="#7c8dd8" stroke-width="2" stroke-opacity="0.28">
          <path d="M340 1490 h200 M340 1524 h320 M340 1558 h120"/>
        </g>
        ${caption({ x: 340, y: 1660, size: 40, anchor: 'start', tracking: 10, opacity: 0.5,
          text: 'WEBWINDOWS  /  DESKTOP  ENVIRONMENT' })}
        ${grainLayer(0.16)}
        ${vignette(0.5)}`;

      return svgDocument(defs, body, background);
    },
  },
  {
    id: '03',
    slug: 'mesh-corner',
    label: 'Mesh gradient with the logo anchored bottom-right',
    build: () => {
      const background = `
        <rect width="${WIDTH}" height="${HEIGHT}" fill="#04060f"/>
        <ellipse cx="700" cy="520" rx="1150" ry="820" fill="#1d4ed8" opacity="0.34" filter="url(#haloSoft)"/>
        <ellipse cx="1500" cy="1900" rx="1150" ry="760" fill="#7c3aed" opacity="0.30" filter="url(#haloSoft)"/>
        <ellipse cx="3100" cy="760" rx="900" ry="620" fill="#2563eb" opacity="0.16" filter="url(#haloSoft)"/>
        <ellipse cx="2600" cy="1700" rx="900" ry="620" fill="#4338ca" opacity="0.26" filter="url(#haloSoft)"/>
        <g fill="#ffffff">
          <circle cx="2380" cy="470" r="3" opacity="0.5"/>
          <circle cx="2860" cy="980" r="2.5" opacity="0.35"/>
          <circle cx="1980" cy="1180" r="2" opacity="0.3"/>
          <circle cx="3320" cy="1420" r="3" opacity="0.4"/>
          <circle cx="2760" cy="1880" r="2" opacity="0.3"/>
          <circle cx="3480" cy="620" r="2" opacity="0.28"/>
          <circle cx="1620" cy="300" r="2.5" opacity="0.32"/>
          <circle cx="3060" cy="240" r="2" opacity="0.26"/>
        </g>`;

      const defs = commonDefs('');

      const body = `
        ${caption({ x: 300, y: 640, size: 40, anchor: 'start', tracking: 18, opacity: 0.55, text: 'DESKTOP  ENVIRONMENT' })}
        <text x="292" y="880" text-anchor="start" font-family="${FONT_STACK}" font-size="240"
              font-weight="300" letter-spacing="6" fill="#3b5bff" opacity="0.75"
              filter="url(#textGlow)">Web</text>
        <text x="292" y="880" text-anchor="start" font-family="${FONT_STACK}" font-size="240"
              font-weight="300" letter-spacing="6" fill="url(#wordInk)">Web</text>
        <text x="292" y="1120" text-anchor="start" font-family="${FONT_STACK}" font-size="240"
              font-weight="300" letter-spacing="6" fill="#7c3aed" opacity="0.75"
              filter="url(#textGlow)">Windows</text>
        <text x="292" y="1120" text-anchor="start" font-family="${FONT_STACK}" font-size="240"
              font-weight="300" letter-spacing="6" fill="url(#wordInk)">Windows</text>
        ${rule({ x: 296, y: 1206, width: 820 })}
        ${caption({ x: 296, y: 1300, size: 44, anchor: 'start',
          text: 'Everything you run, in one window' })}
        ${logo({ width: 560, x: 2760, y: 1280, halo: 0.24 })}
        ${grainLayer(0.17)}
        ${vignette(0.55)}`;

      return svgDocument(defs, body, background);
    },
  },
  {
    id: '04',
    slug: 'grid-focus',
    label: 'Technical grid, framed mark, calm centre',
    build: () => {
      const background = `
        <rect width="${WIDTH}" height="${HEIGHT}" fill="#04061a"/>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgBase)"/>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#microGrid)"/>
        <g stroke="#5b7cff" stroke-opacity="0.14" fill="none" stroke-width="1.5">
          <path d="M0 990 H3840"/>
          <path d="M1920 0 V2160"/>
        </g>`;

      const defs = commonDefs(`
        <linearGradient id="bgBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0c1550"/>
          <stop offset="0.55" stop-color="#070c2b"/>
          <stop offset="1" stop-color="#03040f"/>
        </linearGradient>
        <pattern id="microGrid" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M120 0 H0 V120" fill="none" stroke="#8ea4ff" stroke-opacity="0.08" stroke-width="1.5"/>
        </pattern>`);

      const body = `
        <ellipse cx="1920" cy="880" rx="1150" ry="620" fill="#3f5cff" opacity="0.16" filter="url(#haloSoft)"/>
        <ellipse cx="1920" cy="1760" rx="1450" ry="400" fill="#7c3aed" opacity="0.20" filter="url(#haloSoft)"/>
        <g fill="none" stroke="#8ea4ff" stroke-width="2">
          <rect x="1240" y="360" width="1360" height="1500" rx="20" stroke-opacity="0.18"/>
          <g stroke-opacity="0.5" stroke-width="3">
            <path d="M1240 460 L1240 360 L1340 360"/>
            <path d="M2600 360 L2500 360"/>
            <path d="M2600 1860 L2600 1760 L2500 1760"/>
          </g>
        </g>
        ${logo({ width: 620, x: 1610, y: 540, halo: 0.22 })}
        ${wordmark({ x: 1920, y: 1540, size: 158, tracking: 40, weight: 200 })}
        ${rule({ x: 1520, y: 1620, width: 800, opacity: 0.4 })}
        ${caption({ x: 1920, y: 1710, size: 40, tracking: 16, opacity: 0.5,
          text: 'BUILT FOR THE OPEN WEB' })}
        ${grainLayer(0.15)}
        ${vignette(0.5)}`;

      return svgDocument(defs, body, background);
    },
  },
];

/* ----------------------------------------------------------------- render */

function resolveChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      /* try next */
    }
  }
  throw new Error('No Chrome or Edge executable found for PNG rendering.');
}

function renderPng(chrome, svgPath, pngPath, profileDir) {
  const htmlPath = pngPath.replace(/\.png$/i, '.render.html');
  writeFileSync(
    htmlPath,
    `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:#04071a;overflow:hidden}
svg{display:block;width:${WIDTH}px;height:${HEIGHT}px}</style>
${readFileSync(svgPath, 'utf8')}`,
    'utf8',
  );
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--default-background-color=00000000',
      `--window-size=${WIDTH},${HEIGHT}`,
      `--user-data-dir=${profileDir}`,
      `--screenshot=${pngPath}`,
      `file:///${htmlPath.replace(/\\/g, '/')}`,
    ],
    { stdio: 'ignore' },
  );
  return htmlPath;
}

function main() {
  const args = process.argv.slice(2);
  const only = args.find((a) => a.startsWith('--only='))?.slice('--only='.length);
  const wantPng = !args.includes('--no-png');

  mkdirSync(outDir, { recursive: true });
  mkdirSync(srcDir, { recursive: true });

  const selected = only ? variants.filter((v) => v.id === only || v.slug === only) : variants;
  if (selected.length === 0) {
    throw new Error(`No wallpaper variant matched "${only}". Available: ${variants.map((v) => v.id).join(', ')}`);
  }

  const chrome = wantPng ? resolveChrome() : null;
  const profileDir = path.join(outDir, '.chrome-profile');

  const written = [];
  for (const variant of selected) {
    const name = `webwindows-${variant.id}-${variant.slug}`;
    const svgPath = path.join(srcDir, `${name}.svg`);
    writeFileSync(svgPath, variant.build(), 'utf8');
    written.push(svgPath);

    if (wantPng) {
      const pngPath = path.join(outDir, `${name}-3840x2160.png`);
      const tempHtml = renderPng(chrome, svgPath, pngPath, profileDir);
      written.push(pngPath);
      console.log(`rendered ${path.relative(root, pngPath)}`);
    }
    console.log(`wrote    ${path.relative(root, svgPath)}  (${variant.label})`);
  }

  console.log(`\n${written.length} file(s) written.`);
}

main();
