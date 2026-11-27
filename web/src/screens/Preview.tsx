import { RecordView, type Phase, type ViewProps } from './RecordScreen'
import { PROMPTS } from '../lib/format'

/**
 * Development-only: renders any state of the recording screen without a
 * microphone or server, e.g. /?preview=result. All content is sample data.
 */
const SAMPLE = {
  id: 'sample',
  recordedAt: new Date().toISOString(),
  transcript:
    "Long day. The morning was slow, I finally finished the upload pipeline and it actually worked on the first real file, which felt good. Then the afternoon just drained out of me. I keep thinking about whether I said the wrong thing to Sam at lunch. Probably not. I'm going to try to sleep earlier tonight.",
  emotions: [
    { label: 'calm', confidence: 0.52 },
    { label: 'tiredness', confidence: 0.29 },
    { label: 'worry', confidence: 0.14 },
    { label: 'joy', confidence: 0.11 },
  ],
  valence: 0.2,
  energy: 0.3,
  sample: true,
}

const at = (h: number, m: number) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

const STATES: Record<string, { phase: Phase; elapsed?: number; level?: number; saved?: Date[] }> = {
  ready: { phase: { kind: 'ready' } },
  recording: { phase: { kind: 'recording', paused: false, interruption: null }, elapsed: 72, level: 0.62 },
  quiet: { phase: { kind: 'recording', paused: false, interruption: null }, elapsed: 14, level: 0.12 },
  nudge: { phase: { kind: 'recording', paused: false, interruption: null }, elapsed: 284, level: 0.4 },
  paused: { phase: { kind: 'recording', paused: true, interruption: 'screen-locked' }, elapsed: 98 },
  saving: { phase: { kind: 'saving', step: 'listening' } },
  result: { phase: { kind: 'result', analysis: SAMPLE, savedAt: at(22, 41), isNew: true }, saved: [at(22, 41)] },
  silent: {
    phase: { kind: 'result', analysis: { ...SAMPLE, transcript: '', emotions: [{ label: 'tiredness', confidence: 0.4 }] }, savedAt: at(23, 5), isNew: true },
  },
  failed: { phase: { kind: 'failed', offline: false, recordedAt: at(22, 41), seconds: 134 } },
  guide: { phase: { kind: 'recording', paused: false, interruption: null }, elapsed: 192, level: 0.3 },
  denied: { phase: { kind: 'denied' } },
  unsupported: { phase: { kind: 'unsupported' } },
  again: { phase: { kind: 'ready' }, saved: [at(22, 41)] },
}

const noop = () => {}

export function Preview({ state }: { state: string }) {
  const s = STATES[state] ?? STATES.ready
  const props: ViewProps = {
    phase: s.phase,
    today: new Date(),
    savedTimes: s.saved ?? [],
    elapsed: s.elapsed ?? 0,
    level: s.level,
    prompt: PROMPTS[0],
    onShufflePrompt: noop,
    onTogglePrompt: noop,
    onStart: noop,
    onPause: noop,
    onResume: noop,
    onDone: noop,
    onDiscard: noop,
    onRetry: noop,
    onRecordAnother: noop,
    onFinish: noop,
    onTryMicAgain: noop,
  }
  return <RecordView {...props} />
}
