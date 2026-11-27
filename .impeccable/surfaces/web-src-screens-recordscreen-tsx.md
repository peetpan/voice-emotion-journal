---
version: 1
slug: "web-src-screens-recordscreen-tsx"
primary_target: "web/src/screens/RecordScreen.tsx"
related_targets: []
---

# Recording screen

## Scope and mode
Operate. One mobile-first screen covering the whole nightly capture flow: idle → recording → paused → uploading → listening back → first read, plus permission, interruption, cap and failure states. Timeline, entry detail, settings and the meeting analyzer are out of scope.

## Audience and task
The owner, at night, in a dim room, one-handed on a phone. Record 1–3 minutes, tap Done, see a gentle first read, put the phone down.

## Confirmed decisions
- After stop: upload in the background, then show a soft first read (transcript, primary emotion, secondary mix) on the same stage.
- On screen: optional prompt (shuffle/skip), live voice level + timer against a soft 3-minute guide, tonight's status with a Timeline link.
- Pause/resume; gentle nudge at 3:00, hard stop at 5:00; an interruption keeps what was captured.
- Confidence shown as soft words ("strongly", "mostly", "a little", "a trace"), never percentages.
- Defaults chosen in build (user may change): another entry per night is allowed; hard cap 5:00; provisional emotion set is sample data until the models are chosen.

## Anti-goals
No streaks, scores or confetti; no clinical wording; nothing implying data leaves the user's server; no bright flashes in a dark room; no glow halos or decorative orbs.

## Direction contract
THESIS: The voice lights a stage. While recording, one gel pool's brightness follows the voice; after saving it resolves into overlapping translucent gels, one per emotion, density = confidence. Refuses the category default of a scrolling red waveform under a big red button.
OWN-WORLD: Theatre lighting gel swatch book on a dark stage. Stage-black blue-tinted ground (#0f1116 family), panels a step lighter; a fixed set of named gel colours (rose, steel blue, amber, sea green, plus violet and straw), each always paired with a labelled swatch tag (name + soft confidence word). Hanken Grotesk, two working sizes, rank by weight. Large standard rounded buttons; light button = primary.
STORY: The user sees tonight's date and status, an optional prompt, taps Start, talks while the stage gently brightens with their voice, taps Done, watches the pool resolve into labelled gels and reads the transcript, then leaves. Nothing is lost if anything fails.
FIRST VIEWPORT: 390×844. Top bar: date + status left, Timeline pill right. Prompt line (24px) with Shuffle/Skip. Stage fills the middle (~45% height) with the swatch tag row at its foot. Timer + "about 3 min" guide and a thin progress track beneath. Bottom row in thumb reach: Pause/Resume (dark) and Done (light), 56px tall; idle shows one full-width Start recording button.
FORM: Lighting Gels, candidate 1 of 7 on the ordered list (IMPECCABLE'S PICK, chosen by the user over the roll). seed:1a7f60f67c44c7de
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
Kept disciplines: first read stays marked "New" until opened; gels drawn at one fixed scale every night; voice level is the only live driver of the stage.
