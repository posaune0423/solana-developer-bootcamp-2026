# Todo

- [x] Inspect current Marp theme CSS and identify code highlight selectors.
- [x] Update `theme/solana.css` to use a GitHub-aligned syntax highlight palette.
- [x] Review the diff and confirm no unrelated changes were introduced.

# Review

- Updated `theme/solana.css` only for syntax highlighting and inline code styling.
- Verified Marp CLI execution with `bunx --bun @marp-team/marp-cli SLIDE.md --html -o .agents/tmp/slide.html`.
- Removed generated artifacts and reverted an unintended `SLIDE.md` rewrite caused during verification.
