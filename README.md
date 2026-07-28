# Isentropic website

Sources for [isentropic.com.br](https://isentropic.com.br).

| Path | Role |
| --- | --- |
| `*.dc.html` | Page sources — edit these |
| `build-export.js` | Single source of truth for `export/` |
| `export/` | Generated static site — never edited by hand |
| `_ds/` | Design-system bundle; its CSS is inlined at build time |
| `out/` | Images referenced by the sources, rewritten to `assets/` on export |

Deploy by uploading the *contents* of `export/` to the web root.

Brand assets (logo, wordmark, banners) are generated in
[isentropic-fpga/brand](https://github.com/isentropic-fpga/brand); the copies
under `out/` are checked in so the site builds standalone.
