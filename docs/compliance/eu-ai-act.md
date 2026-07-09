# EU AI Act — Article 50 baseline (MVP)

**Deadline: binding from 2 August 2026.** digitalmmm is the AI system *provider*, so the
transparency (marking) obligation is ours, not just the user's.

## What the MVP implements

1. **Machine-readable marking on every export** (`src/lib/marking.ts`):
   - PDF: Producer/Creator/Subject/Keywords metadata identifying the file as
     AI-generated, with a JSON provenance blob (generator, timestamp, product ref).
   - DOCX: creator/description/keywords document properties with the same blob.
2. **Human-readable disclosure**: a colophon line on every export ("AI-generated
   content. Created with digitalmmm.").
3. **Checkout consent step** (EU Consumer Rights Directive, MVP item 15): explicit
   "immediate access waives the 14-day withdrawal right" checkbox before Stripe
   Checkout; the consent timestamp is stored on the subscription row.
4. **Hard content prohibition** (Acceptable Use Policy): non-consensual sexually
   explicit/intimate content is prohibited absolutely, per the AI Act amendments.

## Phase 2 upgrades (when image/audio/video generation ships)

- C2PA content credentials on all raster image, audio and video output (industry
  standard; Adobe/OpenAI/Google/Microsoft-compatible), replacing the MVP's
  metadata-only marking for those media types.
- Deepfake-scope disclosure at first viewer exposure for any content resembling a real
  person (UGC video AI-synthesized mode; voice cloning restricted to the verified
  account owner's own voice).
- Per-platform label auto-application (e.g. Meta "Made with AI") in Create Post.

## Text products note

Article 50's marking duty is scoped to synthetic image/audio/video and certain
public-interest text. We mark **all** exports anyway: it is cheap, honest, satisfies
KDP-style marketplace disclosure expectations, and future-proofs against scope
interpretation drift.
