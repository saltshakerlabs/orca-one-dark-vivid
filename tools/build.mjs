#!/usr/bin/env node
// Writes themes/*.json and terminal/*.json from one palette, so the plain and italic variants
// differ only in font style. Run `node tools/build.mjs` after changing this file.
//
// The palette is One Dark Vivid as the One Dark theme for JetBrains IDEs defines it. Orca colours
// code by asking the theme for a handful of TextMate scopes, one per token type, so the rules
// below name exactly those scopes rather than the hundreds a VS Code theme lists.
import { writeFileSync } from 'node:fs';

const c = {
  background: '#282c34',
  surface: '#21252b',
  currentLine: '#2c313c',
  selection: '#404859',
  border: '#3e4452',
  text: '#bbbbbb',
  muted: '#a0a7b4',
  // JetBrains has #5c6370, which is 2.3:1 on this background. Orca drops a code colour under 3:1
  // and shows its built-in one instead (green, for comments), so this is the same grey, lighter.
  comment: '#6f7887',
  caret: '#528bff',
  red: '#ef596f',
  orange: '#d19a66',
  yellow: '#e5c07b',
  green: '#89ca78',
  cyan: '#2bbac5',
  blue: '#61afef',
  purple: '#d55fde',
  error: '#f44747',
};

const tokens = {
  '--background': c.background,
  '--editor-surface': c.background,
  '--foreground': c.text,
  '--card': c.surface,
  '--popover': c.surface,
  '--sidebar': c.surface,
  '--primary': '#404754',
  '--primary-foreground': '#d7dae0',
  '--secondary': '#30333d',
  '--secondary-foreground': '#c8ccd4',
  '--muted': '#1d1f23',
  '--muted-foreground': c.muted,
  '--accent': c.currentLine,
  '--accent-foreground': c.text,
  '--border': c.border,
  '--ring': c.caret,
  '--sidebar-ring': '#4f5562',
  '--worktree-sidebar-ring': '#4f5562',
  '--sidebar-primary-foreground': '#d7dae0',
  '--text-link': c.blue,
  '--editor-selection': c.selection,
  '--diff-added': c.green,
  '--diff-removed': c.red,
  '--git-decoration-added': c.green,
  '--git-decoration-modified': c.orange,
  '--git-decoration-deleted': c.red,
  '--git-decoration-renamed': c.blue,
  '--git-decoration-untracked': c.green,
  '--git-decoration-ignored': c.comment,
};

const rule = (scope, foreground, fontStyle) => ({
  scope,
  settings: { foreground, ...(fontStyle === undefined ? {} : { fontStyle }) },
});

function tokenColors(italic) {
  const emphasis = italic ? 'italic' : undefined;
  // Orca takes a font style from the nearest rule that sets one, so `keyword.operator` would
  // inherit the italic of `keyword`. An empty style stops that.
  const upright = italic ? '' : undefined;
  return [
    rule(['comment', 'markup.quote', 'meta.separator'], c.comment, emphasis),
    rule(['string', 'markup.inline.raw'], c.green),
    rule(['constant.character.escape', 'string.regexp'], c.cyan),
    rule(['constant', 'constant.numeric', 'constant.language'], c.orange),
    rule('keyword.other.unit', c.orange, upright),
    rule(['keyword', 'keyword.control', 'storage'], c.purple, emphasis),
    rule('keyword.operator', c.text, upright),
    rule(['punctuation', 'punctuation.definition.tag'], c.text),
    rule(['entity.name.type', 'support.type', 'support.class', 'meta.decorator'], c.yellow),
    rule(['entity.name.function', 'support.function'], c.blue),
    rule(['variable', 'support.variable', 'support.type.property-name', 'entity.name.tag'], c.red),
    rule(['variable.parameter', 'entity.other.attribute-name'], c.orange),
    rule(['markup.heading', 'entity.name.section.markdown', 'punctuation.definition.heading.markdown'], c.cyan, 'bold'),
    rule('markup.bold', c.orange, 'bold'),
    rule('markup.italic', c.purple, 'italic'),
    rule('markup.underline.link', c.purple, 'underline'),
    rule('invalid', c.error),
  ];
}

const terminal = {
  schemaVersion: 1,
  mode: 'dark',
  terminal: {
    foreground: c.text,
    background: c.background,
    cursor: c.caret,
    selectionBackground: c.selection,
    black: '#3f4451',
    red: c.red,
    green: c.green,
    yellow: c.yellow,
    blue: c.blue,
    magenta: c.purple,
    cyan: c.cyan,
    white: c.text,
    brightBlack: '#646a73',
    brightRed: '#ff7a8a',
    brightGreen: '#a5e075',
    brightYellow: '#f0d197',
    brightBlue: '#7cc1ff',
    brightMagenta: '#e58af0',
    brightCyan: '#4cd1e0',
    brightWhite: '#e6e6e6',
  },
};

// Orca's rule, from its theme code: a code colour needs 3:1 against the editor surface or it is
// ignored without a word. Fail here instead.
const luminance = (hex) =>
  [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
for (const { scope, settings } of tokenColors(false)) {
  const ratio = contrast(settings.foreground, c.background);
  if (ratio < 3) {
    throw new Error(`${scope}: ${settings.foreground} is ${ratio.toFixed(2)}:1 on ${c.background}; Orca needs 3:1`);
  }
}

const write = (path, value) =>
  writeFileSync(new URL(`../${path}`, import.meta.url), `${JSON.stringify(value, null, 2)}\n`);
const theme = (italic) => ({ schemaVersion: 1, base: 'dark', tokens, tokenColors: tokenColors(italic) });

write('themes/one-dark-vivid.json', theme(false));
write('themes/one-dark-vivid-italic.json', theme(true));
write('terminal/one-dark-vivid.json', terminal);
console.log('wrote themes/ and terminal/');
