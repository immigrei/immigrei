# Creatives — storage convention

Git holds only the **source** of each creative: `.md` (scripts/copy/narration
text) and `.svg` (vector image source — small, diffable, human-readable).

Git does **not** hold generated binaries: `.mp4`, `.mov`, `.png` (rendered
frames), `.aiff`/`.mp3`/`.wav` (audio). These are regenerated on demand from
the `.svg`/`.md` sources and are large + non-diffable, so committing them
bloats the repo permanently (git never shrinks after a binary is removed from
history without a rewrite).

**Where the binaries actually live:** Supabase Storage (bucket TBD — see
`immigrei-midias/README.md` once a bucket is set up), so César/Felipe get a
shareable URL without weighing down every clone of this repo.

One approved exception: `reel-template/reference-contact-sheet.png` — a
small (640KB), one-time visual reference for the house Reel style, not a
per-post generated asset.
