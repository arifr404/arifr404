import { mkdir, writeFile } from 'node:fs/promises';

const source = new URL('https://gh-heat.anishroy.com/api/arifr404/svg');
source.search = new URLSearchParams({
  darkMode: 'true',
  bg: '#050606',
  textColor: '#B3B6B6',
  colors: '111414,3B2317,764122,B96430,F28C45',
  borderColor: '#272A2A',
  borderWidth: '0',
  radius: '1',
  font: 'monospace',
  fontSize: '11',
  padding: '20',
  cellSize: '12',
  cellGap: '3',
  showMonthLabels: 'true',
  showDayLabels: 'true',
  showLegend: 'true',
}).toString();

const response = await fetch(source, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) throw new Error(`Calendar fetch failed: HTTP ${response.status}`);

const svg = (await response.text()).trim();
const root = svg.match(/^<svg\b[^>]*>/)?.[0];
const dimensions = root?.match(/viewBox="0 0 (\d+) (\d+)"/);
const cellCount = (svg.match(/class="contrib-cell"/g) ?? []).length;
if (!dimensions || !svg.endsWith('</svg>') || cellCount < 300) {
  throw new Error('Unexpected calendar response; keeping the previous SVG.');
}

const [, width, height] = dimensions;
const contents = svg.slice(root.length, -'</svg>'.length);
const rounded = root.replace('>', ' role="img" aria-labelledby="calendar-title">') + `
<title id="calendar-title">arifr404's GitHub contribution calendar</title>
<defs><clipPath id="calendar-card"><rect width="${width}" height="${height}" rx="6"/></clipPath></defs>
<g clip-path="url(#calendar-card)">${contents}</g>
</svg>
`;

const directory = new URL('../assets/github/stats/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('heatmap.svg', directory), rounded);
console.log(`Updated rounded calendar: ${cellCount} cells, ${width} × ${height}.`);
