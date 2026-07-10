const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../src');
const DESIGN_DATA = path.join(__dirname, '../src/app/common/pages/settings/design/colorTokenData.js');

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'token';

// eslint-disable-next-line no-eval
const groups = eval(
  fs
    .readFileSync(DESIGN_DATA, 'utf8')
    .replace('export const COLOR_TOKEN_GROUPS = ', '')
    .replace(/;\s*export const makeTokenKey[\s\S]*/, ''),
);

const EXT = /\.(jsx?|scss|css|json|svg)$/i;
const SKIP = new Set(['node_modules', 'design/tokenUsageIndex.json']);

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (EXT.test(entry.name)) files.push(full);
  }
  return files;
};

const files = walk(ROOT);
const index = {};

groups.forEach((group) => {
  group.tokens.forEach((token) => {
    const key = `${group.id}::${slugify(token.name)}`;
    index[key] = {
      tokenName: token.name,
      defaultHex: token.hex.toUpperCase(),
      paletteRefs: 0,
      hexRefs: 0,
      fileCount: 0,
      files: [],
    };
  });
});

files.forEach((filePath) => {
  const rel = path.relative(path.join(__dirname, '..'), filePath);
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return;
  }

  Object.keys(index).forEach((key) => {
    const { tokenName, defaultHex } = index[key];
    const paletteName = tokenName.replace(/^\$/, '');
    let paletteHits = 0;
    let hexHits = 0;

    const palettePatterns = [
      `theme.palette.${paletteName}`,
      `palette.${paletteName}`,
    ];
    palettePatterns.forEach((pat) => {
      let i = 0;
      while ((i = content.indexOf(pat, i)) !== -1) {
        paletteHits += 1;
        i += pat.length;
      }
    });

    const hexBody = defaultHex.replace('#', '');
    const hexRe = new RegExp(hexBody, 'gi');
    const hexMatch = content.match(hexRe);
    if (hexMatch) hexHits = hexMatch.length;

    if (paletteHits > 0 || hexHits > 0) {
      index[key].paletteRefs += paletteHits;
      index[key].hexRefs += hexHits;
      if (!index[key].files.includes(rel)) {
        index[key].files.push(rel);
        index[key].fileCount += 1;
      }
    }
  });
});

const output = {};
Object.entries(index).forEach(([key, val]) => {
  output[key] = {
    tokenName: val.tokenName,
    defaultHex: val.defaultHex,
    paletteRefs: val.paletteRefs,
    hexRefs: val.hexRefs,
    fileCount: val.fileCount,
    totalRefs: val.paletteRefs + val.hexRefs,
  };
});

const outPath = path.join(
  __dirname,
  '../src/app/common/pages/settings/design/tokenUsageIndex.json',
);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Wrote ${Object.keys(output).length} entries to tokenUsageIndex.json`);
