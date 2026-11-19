const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { buildSvg, NAMES } = require('../scripts/build-diagrams');

const ASSETS = path.join(__dirname, '..', 'assets');

test('built diagrams are up to date with assets/src (run: node scripts/build-diagrams.js)', () => {
  for (const name of NAMES) {
    const built = buildSvg(fs.readFileSync(path.join(ASSETS, 'src', `${name}.svg`), 'utf8'));
    assert.strictEqual(fs.readFileSync(path.join(ASSETS, `${name}.svg`), 'utf8'), built, `${name}.svg is stale`);
  }
});

test('each diagram embeds the hand-drawn font and wobble filter, and stays self-contained', () => {
  for (const name of NAMES) {
    const svg = fs.readFileSync(path.join(ASSETS, `${name}.svg`), 'utf8');
    assert.ok(svg.includes('@font-face{font-family:"xkcd"') && svg.includes('data:font/woff;base64,'), `${name}: font`);
    assert.ok(svg.includes('<filter id="xkcdify"'), `${name}: filter`);
    assert.ok(!/<script|<foreignObject|https?:\/\/(?!www\.w3\.org)/.test(svg), `${name}: no scripts or external links`);
    assert.ok(/role="img" aria-label="[^"]{40,}"/.test(svg), `${name}: accessible label`);
  }
});
