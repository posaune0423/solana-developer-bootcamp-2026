# Todo

- [x] Inspect current Marp theme CSS and identify code highlight selectors.
- [x] Update `theme/solana.css` to use a GitHub-aligned syntax highlight palette.
- [x] Review the diff and confirm no unrelated changes were introduced.

# Review

- Updated `theme/solana.css` only for syntax highlighting and inline code styling.
- Verified Marp CLI execution with `bunx --bun @marp-team/marp-cli SLIDE.md --html -o .agents/tmp/slide.html`.
- Removed generated artifacts and reverted an unintended `SLIDE.md` rewrite caused during verification.

## 2026-04-07 Security Slides

- [x] Extract slide 18-20 content from `docs/Solana Dev Presentation.pptx`.
- [x] Reimplement the security section in `SLIDE.md` as three Marp slides aligned with the existing deck theme.
- [x] Render the deck with Marp CLI and verify the updated slides compile cleanly.

## 2026-04-07 Review

- [x] Replaced the empty security section in `SLIDE.md` with three Marp slides covering frontend security, program-side checks, and the signer/owner/PDA 3-point set.
- [x] Kept the content aligned with PPTX slides 18-20 while adapting the layout to the existing deck theme using the deck's existing table-centric presentation style.
- [x] Verified compilation with `bunx --bun @marp-team/marp-cli SLIDE.md --html -o .agents/tmp/slide-security-check.html`.
