---
name: Voice Emotion Journal
description: A private nightly voice journal where the voice lights a stage and each feeling lands as a labelled theatre gel.
colors:
  stage: "#0f1116"
  stage-deep: "#0a0c10"
  panel: "#1b1f28"
  panel-up: "#252a35"
  rule: "#2a2f3a"
  ink: "#eef0f3"
  ink-soft: "#a3aab6"
  ink-faint: "#7c8391"
  gel-sea: "#57b39a"
  gel-amber: "#e7b53c"
  gel-steel: "#3f7fd9"
  gel-violet: "#8f72de"
  gel-rose: "#d9486a"
  gel-straw: "#d8c98f"
  gel-open: "#efe6d2"
  live: "#e0697f"
  danger: "#e36b7f"
typography:
  lead:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.012em"
  figure:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  title:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "0.01em"
  label:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  swatch-chip: "3px"
  badge: "6px"
  tag: "8px"
  panel: "10px"
  button: "14px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  gutter: "20px"
  lg: "28px"
components:
  button-light:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stage}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    padding: "0 16px"
    height: "56px"
  button-light-hover:
    backgroundColor: "#ffffff"
  button-dark:
    backgroundColor: "{colors.panel-up}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    padding: "0 16px"
    height: "56px"
  button-dark-hover:
    backgroundColor: "#2f3542"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.stage-deep}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    padding: "0 16px"
    height: "56px"
  button-quiet:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    height: "44px"
    padding: "0"
  button-quiet-hover:
    textColor: "{colors.ink}"
  pill-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  pill-link-hover:
    backgroundColor: "{colors.panel}"
  swatch-tag:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "6px 12px 6px 10px"
  status-badge:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.gel-straw}"
    typography: "{typography.title}"
    rounded: "{rounded.badge}"
    padding: "1px 8px"
  kept-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "12px 14px"
  progress-track:
    backgroundColor: "{colors.rule}"
    height: "4px"
---

# Design System: Voice Emotion Journal

## Overview

**Creative North Star: "Lighting Gels"**

A theatre lighting gel swatch book laid out on a dark stage. The screen is a blue-black theatre used in a dark bedroom at night; the only light on it is the user's own voice. While recording, a single open-white lamp throws a beam down onto the floor and its pool brightens and spreads with the voice. When the entry is saved, the light resolves into overlapping translucent gels, one per emotion, whose size and density carry confidence, each paired with a labelled swatch tag below the stage.

The system is quiet and low-energy by design: two type sizes ranked by weight, panels only one step lighter than the ground, large rounded thumb-reach buttons where the light button is always the primary action. Colour is reserved for meaning. The six named gels plus Open white are the only chromatic values on screen, and a gel never appears without its name.

Depth comes from light, not from shadow. Beam, pool and gels are additive (screen-blended) light on black; surfaces are flat tonal steps.

**Key Characteristics:**
- Dark stage ground (stage) with flat panels one step up; no shadows anywhere.
- A fixed gel set mapped one-to-one to emotions, always labelled with name + soft word.
- Voice level is the only live driver of the stage; everything else is still.
- Hanken Grotesk at two working sizes (15px and 24px), hierarchy by weight.
- 56px rounded buttons in the bottom thumb zone; light = primary, dark = secondary.

## Colors

A blue-black stage with cool grey inks, and a small set of saturated-but-soft gel colours that only ever mean an emotion.

### Primary
- **Open White** (gel-open): the lamp. Tints the beam and floor pool while recording, and is the neutral gel for any emotion label without a named gel.
- **Straw** (gel-straw): the working accent of the interface itself, kept because it is the warmest, least emotionally loaded gel. Focus rings, the progress fill, the "New" status badge, and the spike tape on the unlit stage (at 0.5 opacity). Also the gel for tiredness.

### Secondary (the gel set)
Each gel is bound to exactly one emotion, rendered at one fixed scale every night so nights compare by eye.
- **Sea Green** (gel-sea): calm.
- **Amber** (gel-amber): joy.
- **Steel Blue** (gel-steel): sadness. Also the text-selection tint (45% mix).
- **Violet** (gel-violet): worry.
- **Rose** (gel-rose): frustration.
- **Straw** (gel-straw): tiredness.

### Tertiary
- **Cue Light** (live): the small pulsing dot beside "Listening" while recording. Nothing else.
- **Discard Red** (danger): the confirm-discard button only, with stage-deep text.

### Neutral
- **Stage** (stage): page ground everywhere.
- **Stage Deep** (stage-deep): text on the danger button.
- **Panel** (panel): swatch tags, the kept-audio row, pill hover.
- **Panel Up** (panel-up): dark buttons; pill hover border.
- **Rule** (rule): hairline borders (pill outline) and the empty progress track.
- **Ink** (ink): primary text and the light button fill.
- **Ink Soft** (ink-soft): status lines, secondary copy, confidence words, quiet buttons, collapsed transcript.
- **Ink Faint** (ink-faint): sample-mode notes, the idle live dot, the 3-minute guide tick.

### Named Rules
**The Labelled Gel Rule.** A gel colour never appears without its swatch tag naming the emotion and a soft confidence word. Colour is never the only carrier of meaning.

**The Gels Mean Feelings Rule.** The six gel colours are reserved for emotions (Straw also carries the interface accent). Don't use a gel as decoration, a brand colour, or a category colour for anything else.

**The One Lamp Rule.** While recording, the stage holds one open-white lamp only. Gel colour appears on the stage only after the entry has been read.

## Typography

**Display Font:** Hanken Grotesk (with system-ui, -apple-system, sans-serif), self-hosted variable woff2, weights 100–900.
**Body Font:** Hanken Grotesk, same file.

**Character:** One plain, warm grotesk at two sizes. Hierarchy comes from weight (400 / 500 / 600 / 700), never from extra sizes.

### Hierarchy
- **Lead** (500, 24px, 1.25, -0.012em): the prompt, the first-read sentence, and state headlines ("Microphone access is off."). Balanced wrap, max 22ch (24ch on the result).
- **Figure** (600, 24px, tabular numerals, -0.01em): the recording timer.
- **Title** (700, 15px, +0.01em): the date, button labels, the "New" badge.
- **Label** (600, 15px): swatch-tag names, pill and quiet-button labels, the state chip.
- **Body** (400, 15px, 1.45): status lines, notes, transcript (max 65ch, clamped to 3 lines until opened).

### Named Rules
**The Two Sizes Rule.** The working sizes are 15px and 24px. Rank by weight and ink tone, not by adding sizes.

**The Soft Words Rule.** Confidence is spoken, never numbered. Swatch tags use "strong", "clear", "a little", "faint"; the reading sentence uses "mostly", "a little", "some", "a trace of". No percentages, scores or bars for emotion.

## Layout

A single phone-shaped column (max 460px, 20px gutter), fixed to the viewport height so controls stay in thumb reach and the stage absorbs the remaining space. Five rows top to bottom: top bar (date + status left, Timeline pill right), lead (prompt or reading, 28px top padding), stage (flexible, min 132px), clock or transcript, and controls (56px buttons, 20px top padding). Safe-area insets pad top and bottom.

The stage's lighting rig is always square, sized to min(width, height) of its box, and gels sit in six fixed slot positions with a fixed confidence-to-diameter formula, so every night is drawn at the same scale.

Breakpoints are height-led, because the screen is locked to the viewport:
- **Default:** the column is locked to 100dvh and the stage row absorbs the slack.
- **Short (max-height 740px), result phase only:** the column releases to height auto (min 100dvh) and the page scrolls; the rig box takes an explicit 220px height so the gels keep a definite size instead of being squeezed away.
- **Compact (max-height 700px):** lead padding drops to 18px, stage margin to 12px, the collapsed transcript clamps to 2 lines, button padding to 12px.
- **Desktop (min-width 600px and min-height 860px):** the stage row is fixed at 440px and the column centres vertically in the window.
- **Open transcript (any size):** the column releases to height auto and scrolls, with the stage row at minmax(240px, 1fr).

Spacing rhythm steps 8 / 12 / 16 / 20 / 28; tag rows and foot stacks use 8–10px gaps, button rows 12px.

## Elevation & Depth

Flat. No box-shadows exist in the system. Surfaces separate by tonal steps (stage, panel, panel-up). Depth on the stage is made of additive light: the beam, the floor pool and the gels use `mix-blend-mode: screen` on the dark ground, so overlaps brighten and mix like real gels.

### Named Rules
**The Light Not Shadow Rule.** Depth is light added to the stage, never shadow cast beneath a surface.

**The Voice Drives Light Rule.** Beam opacity and pool size/brightness follow the live voice level and nothing else. Unlit (idle, which includes failed and denied) shows only the spike tape on the floor; paused dims the pool to 0.12; listening-back breathes the pool slowly (2.8s, 0.18–0.42 opacity).

## Shapes

Gently rounded rectangles for everything you touch (14px buttons, 10px panels, 8px tags), a full pill for the one navigation link, and true circles only for light: the floor pool and the gels. Swatch chips are 12px squares with 3px corners, reading as cut gel samples rather than dots. The beam is a trapezoid clipped from a gradient. The spike tape is the one line drawing: short straight strokes with round caps (a centre cross and two T-marks), never a closed shape.

## Components

### Buttons
Large, calm and thumb-sized.
- **Shape:** gently rounded (14px), 56px tall, full-width or split 50/50 in a row with a 12px gap.
- **Light (primary):** ink fill, stage text, weight 700; hover goes to pure white. Start, Done, Done for tonight, Try again.
- **Dark (secondary):** panel-up fill, ink text; hover #2f3542. Pause, Resume, Record another, Keep.
- **Danger:** danger fill with stage-deep text, only inside the discard confirmation.
- **Quiet:** no fill, ink-soft text at 600, 44px hit area, hover to ink. Shuffle, Hide prompt, Read the transcript, Discard.
- **States:** press scales to 0.98 over 120ms; disabled drops to 0.45 opacity. Lucide line icons at 20px (16px in quiet buttons), stroke 2, precede the label.

### Pill Link
Timeline link in the top bar: 40px tall, 1px rule outline, full pill radius, label weight; hover fills with panel.

### Swatch Tags
The legend of the swatch book. Panel background, 8px radius, a 12px gel chip, the emotion name at 600 and the soft confidence word in ink-soft. Wrap in a row with 8px gaps at the foot of the stage.

### Status Badge
"New" beside the first reading until it is opened: straw text on a straw-tinted panel (18% mix), 6px radius, weight 700.

### State Chip
"Listening" / "Paused" with an 8px dot: ink-faint when paused, cue-light and slowly pulsing (1.8s) while live.

### Clock and Progress Track
Timer at Figure style left, "about 3 min" guide in ink-soft right; beneath, a 4px rule track with a straw fill and a 2px ink-faint tick at the 3-minute guide.

### Lighting Rig (signature)
The stage: spike tape on the floor line (68% down the rig) marks where the light will land, as an inline SVG of a centre cross and two T-marks at the pool's edges, stroked in Straw at 0.5 opacity, 2px non-scaling, round caps. It shows while the stage is unlit (idle, failed, denied, and still while paused) and fades out over 600ms once the lamp is lit, listening back or resolved; a beam throws down from above and lands as a radial open-white pool. After saving, gels gather at the pool's centre and move out to their fixed slots (1200ms transform, 900ms opacity, 90ms stagger, ease-out cubic-bezier(0.16, 1, 0.3, 1)). Gel diameter is 30% + 56% of confidence; density is 0.42 + 0.5 of confidence. Under reduced motion, transitions drop, the listening pool holds at 0.3, and the live level is quantised to quarter steps.

## Do's and Don'ts

### Do:
- **Do** pair every gel colour on screen with a swatch tag naming the emotion and a soft confidence word.
- **Do** keep the primary action as the light button (ink fill) in the bottom row, 56px tall.
- **Do** let the voice level be the only live driver of stage light; everything else on screen stays still while recording.
- **Do** draw gels at the fixed rig scale and slot positions every night so nights compare by eye.
- **Do** separate surfaces by tonal steps (stage, panel, panel-up) and keep them flat.
- **Do** use Straw for focus rings (2px, 3px offset) and progress.

### Don't:
- **Don't** show confidence as percentages, scores, bars or streaks.
- **Don't** use a gel colour for anything other than its emotion (Straw excepted as the interface accent).
- **Don't** add box-shadows, glow halos around controls, or decorative circles that aren't bound to the voice level or an emotion reading.
- **Don't** use bright flashes or fast transitions on the stage; light changes ease over 600–1200ms outside live recording.
- **Don't** add a third type size; rank by weight.
- **Don't** introduce a red record button or a scrolling waveform; the lamp and pool are the recording feedback.
