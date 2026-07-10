const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../src');
const OUT_PATH = path.join(
  __dirname,
  '../src/app/common/pages/settings/design/hardcodedHexIndex.json',
);
const PALETTE_PATH = path.join(__dirname, '../src/theme/palette.js');

const EXT = /\.(jsx?|scss|css|json|svg)$/i;
const SKIP_DIRS = new Set(['node_modules']);
const SKIP_FILES = new Set([
  'hardcodedHexIndex.json',
  'tokenUsageIndex.json',
  'colorTokenData.js',
]);

const MAX_FILES_PER_HEX = 35;
const MAX_LINE_PREVIEW = 6;

const expandShortHex = (hex) => {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toUpperCase();
  }
  return hex.toUpperCase();
};

const loadPaletteHexMap = () => {
  const content = fs.readFileSync(PALETTE_PATH, 'utf8');
  const map = {};
  const re = /(\w+):\s*'(#[^']+)'/g;
  let m;
  while ((m = re.exec(content))) {
    map[expandShortHex(m[2])] = m[1];
  }
  return map;
};

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (EXT.test(entry.name) && !SKIP_FILES.has(entry.name)) files.push(full);
  }
  return files;
};

const hexRe = /#([0-9A-Fa-f]{3})\b|#([0-9A-Fa-f]{6})\b/g;

const paletteHexToToken = loadPaletteHexMap();
const files = walk(ROOT);
const byHex = {};

files.forEach((filePath) => {
  const rel = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
  if (rel.includes('/settings/design/hardcodedHexIndex')) return;

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return;
  }

  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    let match;
    hexRe.lastIndex = 0;
    while ((match = hexRe.exec(line))) {
      const raw = `#${match[1] || match[2]}`;
      const hex = expandShortHex(raw);
      if (!byHex[hex]) byHex[hex] = { totalRefs: 0, byFile: {} };
      byHex[hex].totalRefs += 1;
      const lineNo = idx + 1;
      if (!byHex[hex].byFile[rel]) byHex[hex].byFile[rel] = [];
      byHex[hex].byFile[rel].push(lineNo);
    }
  });
});

const colors = Object.entries(byHex)
  .map(([hex, data]) => {
    const locations = Object.entries(data.byFile)
      .map(([file, lines]) => ({
        file,
        lines: [...new Set(lines)].sort((a, b) => a - b),
        count: lines.length,
      }))
      .sort((a, b) => b.count - a.count);

    const shown = locations.slice(0, MAX_FILES_PER_HEX).map(({ file, lines }) => ({
      file,
      count: lines.length,
      lines: lines.slice(0, MAX_LINE_PREVIEW),
      hasMoreLines: lines.length > MAX_LINE_PREVIEW,
    }));
    return {
      hex,
      matchingToken: paletteHexToToken[hex] || null,
      totalRefs: data.totalRefs,
      fileCount: locations.length,
      truncated: locations.length > MAX_FILES_PER_HEX,
      locations: shown,
    };
  })
  .sort((a, b) => b.totalRefs - a.totalRefs);

const output = {
  generatedAt: new Date().toISOString(),
  totalUniqueColors: colors.length,
  totalReferences: colors.reduce((s, c) => s + c.totalRefs, 0),
  colors,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
console.log(
  `Wrote ${colors.length} unique hex colors (${output.totalReferences} refs) to hardcodedHexIndex.json`,
);
