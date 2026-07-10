/**
 * Stub canvas so the native .node binary is never loaded (fixes tests on any Node version).
 * Run after npm install. Optional: add "postinstall": "node scripts/stubCanvasForTests.js"
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'node_modules', 'canvas');
if (!fs.existsSync(dir)) process.exit(0);

// 1. Stub bindings.js (the only file that require()s the .node binary)
fs.writeFileSync(
  path.join(dir, 'lib', 'bindings.js'),
  `'use strict';
const s = { createCanvas: () => ({ getContext: () => ({}), toDataURL: () => '' }), Canvas: {}, ImageData: function(){}, CanvasGradient: function(){}, Backends: {}, cairoVersion: '', jpegVersion: '', gifVersion: '', freetypeVersion: '', rsvgVersion: '', pangoVersion: '' };
s.ImageData.prototype = s.CanvasGradient.prototype = { toString: () => '[object ImageData]' };
module.exports = s;
`,
  'utf8'
);

// 2. Stub index.js so require('canvas') never runs the rest of the package
fs.writeFileSync(
  path.join(dir, 'index.js'),
  `'use strict';
const createCanvas = () => ({ getContext: () => ({}), toDataURL: () => '' });
module.exports = { createCanvas, Canvas: { createCanvas }, Image: function(){}, ImageData: function(){}, CanvasGradient: function(){}, CanvasPattern: function(){}, PNGStream: function(){}, PDFStream: function(){}, JPEGStream: function(){}, Context2d: function(){}, CanvasRenderingContext2D: function(){}, DOMMatrix: function(){}, DOMPoint: function(){}, registerFont: function(){}, deregisterAllFonts: function(){}, parseFont: function(){}, createImageData: () => ({}), loadImage: () => Promise.resolve({}), backends: {}, version: '2.11.2', cairoVersion: '', jpegVersion: '', gifVersion: '', freetypeVersion: '', rsvgVersion: '', pangoVersion: '' };
`,
  'utf8'
);

console.log('Canvas stubbed for tests.');
