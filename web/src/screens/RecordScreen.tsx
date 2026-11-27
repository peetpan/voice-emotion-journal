import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { Check, Mic, Pause, Play, RotateCcw, Shuffle, X } from 'lucide-react'
import { Stage, type StageMode } from '../components/Stage'
import { analyzeEntry, sampleMode, ServerUnavailable, type Analysis } from '../lib/api'
import { emotionName, gelFor, readingSentence, strengthWord } from '../lib/emotions'
import { clock, dayLabel, PROMPTS, timeOfDay } from '../lib/format'
import { deletePending, journalDay, oldestPending, rememberSaved, savedTonight, savePending, type PendingEntry } from '../lib/storage'
import { useRecorder, type Interruption } from '../lib/useRecorder'
import './record.css'

const GUIDE_SECONDS = 180
const MAX_SECONDS = 300
const MIN_SECONDS = 1

export type Phase =
  | { kind: 'ready' }
  | { kind: 'requesting' }
  | { kind: 'recording'; paused: boolean; interruption: Interruption }
  | { kind: 'saving'; step: 'saving' | 'listening' }
  | { kind: 'result'; analysis: Analysis; savedAt: Date; isNew: boolean }
  | { kind: 'failed'; offline: boolean; recordedAt: Date; seconds: number }
  | { kind: 'denied' }
  | { kind: 'no-mic' }
  | { kind: 'unsupported' }

export type ViewProps = {
  phase: Phase
  today: Date
  savedTimes: Date[]
  elapsed: number
  levelRef?: RefObject<number>
  level?: number
  prompt: string | null
  onShufflePrompt: () => void
  onTogglePrompt: () => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onDone: () => void
  onDiscard: () => void
  onRetry: () => void
  onRecordAnother: () => void
  onFinish: () => void
  onTryMicAgain: () => void
}

/* ------------------------------------------------------------------ */
/* Container: owns the recorder, the upload and the persisted pending  */
/* ------------------------------------------------------------------ */

export function RecordScreen() {
  const [phase, setPhase] = useState<Phase>({ kind: 'ready' })
  const [savedTimes, setSavedTimes] = useState<Date[]>(() => savedTonight())
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length))
  const [promptHidden, setPromptHidden] = useState(() => {
    try {
      return localStorage.getItem('vej.prompt-hidden') === '1'
    } catch {
      return false
    }
  })
  const pendingRef = useRef<PendingEntry | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const doneRef = useRef<() => void>(() => {})

  const recorder = useRecorder({ maxSeconds: MAX_SECONDS, onLimitReached: () => doneRef.current() })

  const upload = useCallback(async (entry: PendingEntry) => {
    pendingRef.current = entry
    setPhase({ kind: 'saving', step: 'saving' })
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    await savePending(entry)
    const stepTimer = window.setTimeout(() => setPhase({ kind: 'saving', step: 'listening' }), 900)
    try {
      const analysis = await analyzeEntry(entry.audio, new Date(entry.recordedAt), ctrl.signal)
      await deletePending(entry.id)
      pendingRef.current = null
      const savedAt = new Date(entry.recordedAt)
      rememberSaved(savedAt)
      setSavedTimes(savedTonight())
      setPhase({ kind: 'result', analysis, savedAt, isNew: true })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      if (!(err instanceof ServerUnavailable)) console.error(err)
      setPhase({ kind: 'failed', offline: !navigator.onLine, recordedAt: new Date(entry.recordedAt), seconds: entry.seconds })
    } finally {
      window.clearTimeout(stepTimer)
    }
  }, [])

  // A recording that never reached the server comes back first.
  useEffect(() => {
    let live = true
    oldestPending().then((p) => {
      if (live && p) {
        pendingRef.current = p
        setPhase({ kind: 'failed', offline: !navigator.onLine, recordedAt: new Date(p.recordedAt), seconds: p.seconds })
      }
    })
    return () => {
      live = false
      abortRef.current?.abort()
    }
  }, [])

  // Mirror the recorder into the screen phase.
  useEffect(() => {
    const s = recorder.state
    if (s === 'requesting') setPhase({ kind: 'requesting' })
    else if (s === 'recording' || s === 'paused')
      setPhase({ kind: 'recording', paused: s === 'paused', interruption: recorder.interruption })
    else if (s === 'denied' || s === 'no-mic' || s === 'unsupported') setPhase({ kind: s })
  }, [recorder.state, recorder.interruption])

  const onDone = useCallback(async () => {
    const recordedAt = new Date()
    const result = await recorder.stop()
    if (!result || result.seconds < MIN_SECONDS) {
      setPhase({ kind: 'ready' })
      return
    }
    upload({ id: crypto.randomUUID(), recordedAt: recordedAt.toISOString(), seconds: result.seconds, audio: result.blob })
  }, [recorder, upload])
  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  const onDiscard = useCallback(async () => {
    if (phase.kind === 'failed' && pendingRef.current) {
      await deletePending(pendingRef.current.id)
      pendingRef.current = null
    } else {
      recorder.discard()
    }
    setPhase({ kind: 'ready' })
  }, [phase.kind, recorder])

  const togglePrompt = () => {
    setPromptHidden((h) => {
      try {
        localStorage.setItem('vej.prompt-hidden', h ? '0' : '1')
      } catch {
        /* convenience only */
      }
      return !h
    })
  }

  return (
    <RecordView
      phase={phase}
      today={journalDay()}
      savedTimes={savedTimes}
      elapsed={recorder.elapsed}
      levelRef={recorder.levelRef}
      prompt={promptHidden ? null : PROMPTS[promptIndex]}
      onShufflePrompt={() => setPromptIndex((i) => (i + 1 + Math.floor(Math.random() * (PROMPTS.length - 1))) % PROMPTS.length)}
      onTogglePrompt={togglePrompt}
      onStart={recorder.start}
      onPause={recorder.pause}
      onResume={recorder.resume}
      onDone={onDone}
      onDiscard={onDiscard}
      onRetry={() => pendingRef.current && upload(pendingRef.current)}
      onRecordAnother={() => {
        setPhase({ kind: 'ready' })
        recorder.start()
      }}
      onFinish={() => setPhase({ kind: 'ready' })}
      onTryMicAgain={() => {
        recorder.reset()
        recorder.start()
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* View: pure, so every state can be previewed without a microphone    */
/* ------------------------------------------------------------------ */

function statusLine(phase: Phase, savedTimes: Date[]): string {
  if (phase.kind === 'result') return `Saved at ${timeOfDay(phase.savedAt)}`
  if (savedTimes.length === 0) return 'No entry yet tonight'
  if (savedTimes.length === 1) return `Saved tonight at ${timeOfDay(savedTimes[0])}`
  return `${savedTimes.length} entries tonight`
}

function stageMode(phase: Phase): StageMode {
  switch (phase.kind) {
    case 'recording':
      return phase.paused ? 'paused' : 'live'
    case 'saving':
      return 'listening'
    case 'result':
      return 'resolved'
    default:
      return 'idle'
  }
}

function interruptionNote(i: Interruption): string | null {
  if (i === 'screen-locked') return 'Paused when the screen locked. Everything so far is kept.'
  if (i === 'mic-lost') return 'The microphone was taken by another app. Everything so far is kept.'
  return null
}

function guideText(elapsed: number): string {
  if (elapsed >= MAX_SECONDS - 30) return `Stops at ${clock(MAX_SECONDS)}`
  if (elapsed >= GUIDE_SECONDS) return 'That’s about 3 min. Finish when you’re ready.'
  return 'about 3 min'
}

export function RecordView(p: ViewProps) {
  const { phase } = p
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  useEffect(() => {
    setConfirmDiscard(false)
    if (phase.kind !== 'result') setTranscriptOpen(false)
  }, [phase.kind])

  const recording = phase.kind === 'recording'
  const showPrompt = phase.kind === 'ready' || phase.kind === 'requesting' || recording

  return (
    <main className="screen" data-phase={phase.kind} data-expanded={transcriptOpen}>
      <header className="topbar">
        <div>
          <h1 className="date">{dayLabel(p.today)}</h1>
          <p className="status" aria-live="polite">
            {statusLine(phase, p.savedTimes)}
          </p>
        </div>
        <a className="pill" href="/timeline">
          Timeline
        </a>
      </header>

      <section className="lead">
        <Lead {...p} />
        {showPrompt && !recording && (
          <div className="prompt-actions">
            {p.prompt ? (
              <>
                <button type="button" className="quiet" onClick={p.onShufflePrompt}>
                  <Shuffle aria-hidden size={16} strokeWidth={2} /> Another
                </button>
                <button type="button" className="quiet" onClick={p.onTogglePrompt}>
                  <X aria-hidden size={16} strokeWidth={2} /> Hide prompt
                </button>
              </>
            ) : (
              <button type="button" className="quiet" onClick={p.onTogglePrompt}>
                Show a prompt
              </button>
            )}
          </div>
        )}
      </section>

      <section className="stage" aria-label="Voice light">
        <Stage mode={stageMode(phase)} levelRef={p.levelRef} level={p.level} emotions={phase.kind === 'result' ? phase.analysis.emotions : []} />
        <StageFoot {...p} />
      </section>

      {recording && (
        <section className="clock" aria-label="Recording time">
          <div className="clock-row">
            <span className="time" role="timer">
              {clock(p.elapsed)}
            </span>
            <span className="guide">{guideText(p.elapsed)}</span>
          </div>
          <div className="track" aria-hidden="true">
            <i style={{ width: `${Math.min(100, (p.elapsed / MAX_SECONDS) * 100)}%` }} />
            <b style={{ left: `${(GUIDE_SECONDS / MAX_SECONDS) * 100}%` }} />
          </div>
        </section>
      )}

      {phase.kind === 'result' && (
        <section className="transcript" aria-label="Transcript">
          {phase.analysis.transcript.trim() ? (
            <>
              <p className={transcriptOpen ? 'open' : ''}>{phase.analysis.transcript}</p>
              <button type="button" className="quiet" aria-expanded={transcriptOpen} onClick={() => setTranscriptOpen((o) => !o)}>
                {transcriptOpen ? 'Show less' : 'Read the transcript'}
              </button>
            </>
          ) : (
            <p className="muted">No words came through in this one. The feeling above is read from your voice alone.</p>
          )}
        </section>
      )}

      <footer className="controls">
        {confirmDiscard ? (
          <div className="confirm" role="group" aria-label="Discard this recording?">
            <p>Discard this recording? It can’t be recovered.</p>
            <div className="row">
              <button type="button" className="btn dark" onClick={() => setConfirmDiscard(false)} autoFocus>
                Keep it
              </button>
              <button type="button" className="btn danger" onClick={p.onDiscard}>
                Discard
              </button>
            </div>
          </div>
        ) : (
          <Controls {...p} askDiscard={() => setConfirmDiscard(true)} />
        )}
      </footer>
    </main>
  )
}

function Lead(p: ViewProps) {
  const { phase } = p
  switch (phase.kind) {
    case 'saving':
      return (
        <>
          <h2 className="lead-text">{phase.step === 'saving' ? 'Saving to your journal…' : 'Listening back…'}</h2>
          <p className="sub">
            {sampleMode
              ? 'It takes a moment. In sample mode, nothing leaves this browser.'
              : 'It takes a moment. Your recording stays on your own server.'}
          </p>
        </>
      )
    case 'result':
      return (
        <h2 className="lead-text">
          {readingSentence(phase.analysis.emotions)}
          {phase.isNew && <span className="new">New</span>}
        </h2>
      )
    case 'failed':
      return (
        <>
          <h2 className="lead-text">{phase.offline ? 'You’re offline.' : 'Your journal server didn’t answer.'}</h2>
          <p className="sub">
            The recording from {timeOfDay(phase.recordedAt)} is safe on this phone. Try again once{' '}
            {phase.offline ? 'you’re back online' : 'the server is running'}.
          </p>
        </>
      )
    case 'denied':
      return (
        <>
          <h2 className="lead-text">Microphone access is off.</h2>
          <p className="sub">Allow the microphone for this site in your browser’s settings, then try again.</p>
        </>
      )
    case 'no-mic':
      return (
        <>
          <h2 className="lead-text">No microphone found.</h2>
          <p className="sub">Connect one, or check that no other app is using it, then try again.</p>
        </>
      )
    case 'unsupported':
      return (
        <>
          <h2 className="lead-text">This browser can’t record here.</h2>
          <p className="sub">Recording needs a secure (https) address and a browser with microphone support, such as Safari or Chrome.</p>
        </>
      )
    default:
      return p.prompt ? <h2 className="lead-text">{p.prompt}</h2> : <h2 className="lead-text">Say whatever’s there tonight.</h2>
  }
}

function StageFoot(p: ViewProps) {
  const { phase } = p
  if (phase.kind === 'recording') {
    const note = interruptionNote(phase.interruption)
    return (
      <div className="stage-foot">
        <span className="state-chip" data-live={!phase.paused}>
          <span className="dot" aria-hidden="true" />
          {phase.paused ? 'Paused' : 'Listening'}
        </span>
        {note && <p className="note">{note}</p>}
      </div>
    )
  }
  if (phase.kind === 'result') {
    return (
      <div className="stage-foot">
        <ul className="swatches" aria-label="What came through">
          {phase.analysis.emotions.slice(0, 6).map((e) => (
            <li key={e.label} title={`${gelFor(e.label).gel} gel`}>
              <span className="chip" style={{ background: gelFor(e.label).color }} aria-hidden="true" />
              <span className="name">{emotionName(e.label)}</span>
              <span className="word">{strengthWord(e.confidence)}</span>
            </li>
          ))}
        </ul>
        {phase.analysis.sample && <p className="note sample">Sample analysis: your server isn’t connected yet.</p>}
      </div>
    )
  }
  if (phase.kind === 'failed') {
    return (
      <div className="stage-foot">
        <p className="kept">
          <span>Kept on this phone</span>
          <span>
            {timeOfDay(phase.recordedAt)} · {clock(phase.seconds)}
          </span>
        </p>
      </div>
    )
  }
  if (phase.kind === 'ready' && sampleMode) {
    return (
      <div className="stage-foot">
        <p className="note sample">Sample mode. Recordings stay in this browser until your server is connected.</p>
      </div>
    )
  }
  return null
}

function Controls(p: ViewProps & { askDiscard: () => void }) {
  const { phase } = p
  switch (phase.kind) {
    case 'ready':
    case 'requesting':
      return (
        <button type="button" className="btn light wide" onClick={p.onStart} disabled={phase.kind === 'requesting'}>
          <Mic aria-hidden size={20} strokeWidth={2} />
          {phase.kind === 'requesting' ? 'Waiting for the microphone…' : 'Start recording'}
        </button>
      )
    case 'recording': {
      const canResume = phase.interruption !== 'mic-lost'
      return (
        <>
          <div className="row">
            {phase.paused ? (
              <button type="button" className="btn dark" onClick={p.onResume} disabled={!canResume}>
                <Play aria-hidden size={20} strokeWidth={2} /> Resume
              </button>
            ) : (
              <button type="button" className="btn dark" onClick={p.onPause}>
                <Pause aria-hidden size={20} strokeWidth={2} /> Pause
              </button>
            )}
            <button type="button" className="btn light" onClick={p.onDone} disabled={p.elapsed < MIN_SECONDS}>
              <Check aria-hidden size={20} strokeWidth={2} /> Done
            </button>
          </div>
          {phase.paused && (
            <button type="button" className="quiet center" onClick={p.askDiscard}>
              Discard recording
            </button>
          )}
        </>
      )
    }
    case 'saving':
      return <p className="hint">You can put the phone down. The result will be here when you come back.</p>
    case 'result':
      return (
        <div className="row">
          <button type="button" className="btn dark" onClick={p.onRecordAnother}>
            <Mic aria-hidden size={20} strokeWidth={2} /> Record another
          </button>
          <button type="button" className="btn light" onClick={p.onFinish}>
            Done for tonight
          </button>
        </div>
      )
    case 'failed':
      return (
        <div className="row">
          <button type="button" className="btn dark" onClick={p.askDiscard}>
            Discard
          </button>
          <button type="button" className="btn light" onClick={p.onRetry}>
            <RotateCcw aria-hidden size={20} strokeWidth={2} /> Try again
          </button>
        </div>
      )
    case 'denied':
    case 'no-mic':
      return (
        <button type="button" className="btn light wide" onClick={p.onTryMicAgain}>
          <Mic aria-hidden size={20} strokeWidth={2} /> Try again
        </button>
      )
    case 'unsupported':
      return null
  }
}
