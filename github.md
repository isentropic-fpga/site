repo: isentropic-fpga/site
branch: main

## Sync protocol
The repo is the source of truth — it is what gets deployed. Syncs are **incremental**: diff, then pull only what changed.

1. **Read** the `commit:` under `## Last sync` below — that is the last commit this project was pulled at.
2. **Diff** it against `branch:` (`main`) to get the list of changed paths. Do not list the tree and do not compare file contents by hand.
3. **Pull only those paths**, overwriting the local copies outright. Never reconcile or merge inside a file, and never hand-patch local files to match upstream — the repo wins, always.
4. **Record** the new commit and date under `## Last sync`, moving the previous entry into `## Sync history`.

Do this in one turn, without stopping to ask questions.

**Do not** re-pull the whole tree, byte-compare every file, or read a file from the repo hunting for a small difference — the overwrite makes all of that moot. A full-tree overwrite of every tracked file (the five `.dc.html` sources, `SocialCards.dc.html`, `site.css`, `theme.js`, `build-export.js`, `README.md`, `_ds/`, `out/`, `export/`) is the **fallback only**, for when the recorded commit is missing or the diff fails.

`screenshots/`, `uploads/` and `support.js` are gitignored or runtime-managed: they never reach the repo, and a pull never overwrites them.

Work done in this project that has *not* been pushed is the user's to commit — they manage commits and pushes.

## Last sync
date: 2026-09-09T22:43:06Z
commit: 60ed2a72b652

### Updated in this project
- Incremental pull across four upstream commits: 23 changed files overwritten — all five page sources, `site.css`, `build-export.js`, the regenerated brand/OG assets in `out/` and `export/assets/`, and every `export/` page plus `sitemap.xml`.
- `SocialCards.dc.html` was removed upstream, so it was deleted locally too.
- Later, unpushed: pulled `out/openjls-wordmark.svg` (+ dark cut) from isentropic-fpga/brand and applied Vitor's review comments — the OpenJLS wordmark now stands in for the word on the OpenJLS hero, the Products card and the Home carousel header; version bumped to v1.3 on Home; Contact intro paragraph and the Home carousel's second heading line removed. `build-export.js` copies the new assets and `export/` was rebuilt.

## Screen map
Local sources mirror the repo one-to-one, so every screen tracks the file of the same name.

| Screen | Built from |
| --- | --- |
| Home.dc.html | Home.dc.html, site.css, theme.js, _ds/industry-8df8084b-247a-4c13-b5b0-50b41d41eb2f/styles.css |
| Products.dc.html | Products.dc.html, site.css, theme.js |
| Projects.dc.html | Projects.dc.html, site.css, theme.js |
| Contact.dc.html | Contact.dc.html, site.css, theme.js |
| OpenJLS.dc.html | OpenJLS.dc.html, site.css, theme.js |
| export/ (static build) | build-export.js, out/*, _ds/*/styles.css |

## Related repos
- isentropic-fpga/OpenJLS — source of the OpenJLS page's specs, performance and resource figures.
- isentropic-fpga/brand — generates the logo/wordmark/banner assets checked into `out/`, including the OpenJLS wordmark cuts.

## Sync history
- 2026-07-28T14:09:57Z (commit b25b549ceb80) — incremental pull: one upstream commit touched four files (`Home.dc.html`, `OpenJLS.dc.html`, `export/index.html`, `export/openjls.html`).
- 2026-07-28T13:52:32Z (commit 6a475cd1e497) — full overwrite-from-upstream pull: all 37 tracked files replaced from `main`, picking up the OpenJLS org rename (`VitorMendesC/…` → `isentropic-fpga/…`, report now at `isentropic-fpga.github.io/OpenJLS/`).
- 2026-07-28T13:45:00Z — read the site repo; applied the OpenJLS org rename by targeted find/replace (superseded by the full pull above).
- 2026-07-28T02:08:59Z — from isentropic-fpga/OpenJLS: added the Resources link grid (datasheet, verification report, RTL source, demos) and surfaced the datasheet in the licensing CTA row.
- 2026-07-27T02:55:00Z — built the OpenJLS resource-scaling figure from the README characterization tables (~241–253 MHz, ~7.6k LUTs, ~2.1k FFs, xczu7eg).
