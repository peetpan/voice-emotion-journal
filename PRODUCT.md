# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Mobile-first responsive web app, installable as a PWA. Recording happens in the phone's browser via the MediaRecorder API. A native mobile client is a possible later step, not a current commitment.

## Stack

- Backend: FastAPI (Python): upload handling, transcription, emotion analysis, entry API.
- Frontend: React + Vite + TypeScript, mobile-first, PWA.
- Storage: PostgreSQL for entries, transcripts and emotion scores; audio files on the self-hosted backend.
- Models run locally (e.g. open-source Whisper for transcription plus local emotion models). Exact model choice is still open.

## Users

**Primary:** one person (the owner) reflecting on their own days. At the end of the day, usually on their phone and often in bed or after work, they record a short voice note (1–3 minutes) and later want to see how their emotions shift across days and weeks.

**Secondary:** the project is also the owner's portfolio piece, showing a working speech-emotion pipeline. Reviewers and prospective employers will look at it, so it has to look and behave like a finished product, not a demo.

Multi-user accounts may come later; today it serves a single user.

## Product Purpose

Turn a quick spoken end-of-day note into a private emotional record. Each entry is transcribed, analysed for emotion from both voice and words, and placed on a mood timeline that shows patterns and highlights over time.

Success: recording an entry takes almost no effort at the end of a tired day, and looking back over weeks shows the user something true and useful about how they have been feeling.

## Positioning

It reads emotion from *how* something is said, not only *what* is said: acoustic prosody (pitch, energy, pace) is combined with text emotion from the transcript. And it does this entirely on infrastructure the user owns. Nothing is sent to third-party AI APIs.

## Operating Context

- Recording: phone browser, at night or after work, low energy, often in a dim room or in bed. One-handed and quick.
- Review: browsing the timeline and past entries, on the phone or on a larger screen.
- Pipeline per entry: browser recording → HTTPS upload to the self-hosted backend → local transcription (Whisper) → acoustic emotion model + text emotion analysis (classifier or local LLM, building on the owner's IBM Watson NLP emotion background) → stored result.

## Capabilities and Constraints

**Per-entry output:**
- transcript
- primary emotion
- a mix of secondary emotions, each with a confidence
- a valence score and an energy score, which drive the timeline

**Views:** recording, entry detail, mood timeline with patterns and highlights.

**Privacy (core constraint):**
- Single user, self-hosted (owner's machine or a small private server they control).
- Audio and emotion data never leave that backend; no third-party AI APIs.
- Entries are private by default; nothing is shared or used for training.
- Audio can be deleted per entry.

**Not a clinical tool.** It does not diagnose, assess or give medical advice.

**Planned later (not now):** a "Meeting Emotional Arc Analyzer" that maps how emotions change across a recorded meeting. Multi-user accounts.

**Open decisions:** specific speech-emotion and text-emotion models; how the two signals are weighted and combined; the emotion label set.

## Brand Commitments

- Name: Voice Emotion Journal.
- Tone: private and calm.
- Emotions are presented as gentle, soft signals with uncertainty, never as hard verdicts or labels about the person.

## Evidence on Hand

No real entries, screenshots, sample data, model benchmarks, testimonials or users exist yet. Future work must not invent accuracy figures, user counts, quotes or clinical claims. Demo content must be clearly marked as sample data.

## Product Principles

1. **Recording costs nothing.** The end-of-day capture should be one tap and a few minutes. Any step that adds friction at night has to earn its place.
2. **Signals, not verdicts.** Emotion results are suggestions with visible uncertainty. The app reflects; it never tells the user what they feel or what is wrong with them.
3. **Private by construction.** Data stays on hardware the user controls, deletion is real, and the interface never implies sharing or outside processing.
4. **The pattern is the payoff.** One entry is a note; the value builds over weeks. Timelines and highlights should make change over time readable at a glance.
5. **Product-grade, not a demo.** Every state (empty, recording, processing, error, a long history) is finished, because the app is also the owner's portfolio.

## Accessibility & Inclusion

- Used at night in dim rooms: comfortable low-light viewing matters.
- Emotion must never be conveyed by color alone; labels and values accompany it.
- Standard: WCAG 2.2 AA (assumed baseline; no stricter requirement stated).
- Transcripts make every voice entry readable without audio playback.
