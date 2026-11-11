# Maple Mono for Lumina

The existing sans/mono semantic tokens and the card canvas share Maple Mono.
Latin is the unmodified official v7.9 variable WOFF2 (weights 100–800); Chinese
uses upright CN 400/500/600/700, subset from official `MapleMono-CN-unhinted.zip`.
Sources, input/output SHA-256, bytes and exact codepoints are in `manifest.json`.
Copyright and redistribution terms are in `OFL-Maple.txt` (SIL OFL 1.1;
no Reserved Font Name). CN modifications are subsetting and WOFF2 conversion;
name, copyright and license records are retained.

The 764 CN codepoints are drawn conservatively from Lumina's own TS/TSX UI,
including error text and card samples. The public shard has 359 characters and
the application shard has 405; disjoint unicode ranges load them on demand.
This is a UI subset, not a full news archive font. Unknown names, rare Han,
unsupported IPA and other scripts retain system fallback. All faces use
`font-display: swap`; only the 130,908-byte Latin file is preloaded.
The nine WOFF2 files total 921,228 bytes; each page fetches only needed faces.
No desktop/Nerd Font TTF, local-only font, font CDN or runtime font service is used.

Regenerate after changing UI vocabulary, using original official v7.9 files:

```sh
uv run scripts/subset-maple.py --source-dir /path/to/original-CN-TTFs
```

The generator verifies the original files against the accepted hashes before
writing assets. It requires no application secrets and does not run in builds.
Card exports wait for `document.fonts.ready` before measuring and rasterizing.
