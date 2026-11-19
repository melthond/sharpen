#!/usr/bin/env node
// Builds the README diagrams: assets/src/<name>.svg + the hand-drawn look (embedded xkcd font,
// wobble filter, shared styles) -> assets/<name>.svg. GitHub shows README SVGs as images, which
// can't load outside fonts or stylesheets, so everything is inlined. Run after editing a source.
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');
const NAMES = ['hero', 'how-it-works', 'gate'];
const RED = '#dd4528';

function defs() {
  const font = fs.readFileSync(path.join(ASSETS, 'fonts', 'xkcd-script.woff')).toString('base64');
  const sketch = 'stroke:#000;stroke-width:2;filter:url(#xkcdify)';
  const css = [
    `@font-face{font-family:"xkcd";src:url(data:font/woff;base64,${font}) format("woff")}`,
    `.card,.box{fill:#fff;${sketch}}`,
    `.accent-stroke{stroke:${RED};stroke-width:2.6}`,
    `.button{fill:${RED};${sketch}}`,
    `.rule{stroke:#000;stroke-width:1.5;filter:url(#xkcdify)}`,
    `.line,.arrow{fill:none;${sketch}}`,
    '.arrow{marker-end:url(#arrow)}',
    '.dashed{stroke-dasharray:7 6}',
    'text{font-family:xkcd,"Comic Sans MS",cursive;fill:#000}',
    '.title{font-size:19px}.body{font-size:16px}.note{font-size:14px;fill:#555}',
    `.accent{fill:${RED}}.on-accent{fill:#fff}`,
  ].join('');
  return '<defs>'
    + `<style>${css}</style>`
    // Same wobble Star History uses: noise displaces every stroke a few pixels.
    + '<filter id="xkcdify" width="100%" height="100%" x="-5" y="-5" filterUnits="userSpaceOnUse">'
    + '<feTurbulence baseFrequency=".05" result="noise" type="fractalNoise"/>'
    + '<feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>'
    + '<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
    + '<path d="M1,1 L9,5 L1,9" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></marker>'
    + '</defs>';
}

function buildSvg(source) {
  if (!source.includes('<!--DEFS-->')) throw new Error('source needs a <!--DEFS--> marker');
  return source.replace('<!--DEFS-->', defs());
}

if (require.main === module) {
  for (const name of NAMES) {
    const out = buildSvg(fs.readFileSync(path.join(ASSETS, 'src', `${name}.svg`), 'utf8'));
    fs.writeFileSync(path.join(ASSETS, `${name}.svg`), out);
    console.log(`assets/${name}.svg (${Math.round(out.length / 1024)} KB)`);
  }
}

module.exports = { buildSvg, NAMES };
