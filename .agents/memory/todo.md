# Todo

- [x] Identify the error-handling slide content to replace and confirm the table layout used on page 17.
- [x] Replace the current minor RPC-error table in `SLIDE.md` with 8 higher-frequency `@solana/errors` cases.
- [x] Render the deck with Marp CLI and verify the updated slide compiles cleanly.

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

## 2026-04-09 Review

- [x] Replaced the page-17 error table in `SLIDE.md` with 8 higher-frequency wallet / signing / transaction / RPC errors from `@solana/errors`.
- [x] Updated the lead-in copy so the section scope matches frontend integration failures, not only RPC server errors.
- [x] Verified rendering with `bunx --bun @marp-team/marp-cli SLIDE.md --html -o .agents/tmp/slide-error-check.html` and `bunx --bun @marp-team/marp-cli SLIDE.md --pdf -o .agents/tmp/slide-error-check.pdf`.
