# One Dark Vivid for Orca

One Dark with a more saturated palette, for [Orca](https://github.com/stablyai/orca) 1.4.246 or
newer. The colours are those of One Dark Vivid in the One Dark theme for JetBrains IDEs.

- **One Dark Vivid**: app and editor theme.
- **One Dark Vivid Italic**: the same, with comments and keywords in italics.
- **One Dark Vivid** terminal palette.

Data only: the plugin runs no code and asks for no access.

| Role | Colour |
| --- | --- |
| Keywords | `#d55fde` |
| Strings | `#89ca78` |
| Numbers, constants, parameters, attributes | `#d19a66` |
| Types | `#e5c07b` |
| Functions | `#61afef` |
| Variables, fields, tags, property names | `#ef596f` |
| Escapes, format verbs, regular expressions | `#2bbac5` |
| Comments | `#6f7887` |
| Text | `#bbbbbb` on `#282c34` |

## Install

```sh
orca plugin install saltshakerlabs/orca-one-dark-vivid
```

Then pick a theme in Settings → Appearance.

Comments are lighter than the JetBrains theme's `#5c6370`: Orca ignores a code colour with less
than 3:1 contrast against the editor background, and that grey is 2.3:1.

## Develop

`themes/` and `terminal/` are generated. Edit the palette or the rules in `tools/build.mjs`, then:

```sh
node tools/build.mjs
orca plugin validate .
orca plugin dev load .       # then pick the theme in Settings → Appearance
```

Orca colours code by reducing every token to one of a few token types and asking the theme for one
TextMate scope per type, so the rules list those scopes and nothing else. Orca takes a rule's colour
and its font style separately, each from the most specific rule that sets it. The build fails if a
colour is under the 3:1 contrast Orca requires.

## Licence

MIT; see [LICENSE](LICENSE). The palette comes from the
[One Dark theme for JetBrains IDEs](https://github.com/one-dark/jetbrains-one-dark-theme) by Mark Skelton, ISC.
