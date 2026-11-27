import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'paused'
  | 'denied'
  | 'no-mic'
  | 'unsupported'

/** Why a recording paused without the user asking. */
export type Interruption = 'screen-locked' | 'mic-lost' | null

type Options = {
  /** Hard stop, in seconds. */
  maxSeconds: number
  onLimitReached: () => void
}

const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus']

export function recordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}

function pickMime(): string | undefined {
  return MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported?.(m))
}

/**
 * Microphone capture with pause/resume, a hard cap, a live voice level, and
 * interruption handling that never throws away what was already captured.
 */
export function useRecorder({ maxSeconds, onLimitReached }: Options) {
  const [state, setState] = useState<RecorderState>(() => (recordingSupported() ? 'idle' : 'unsupported'))
  const [elapsed, setElapsed] = useState(0)
  const [interruption, setInterruption] = useState<Interruption>(null)

  /** 0–1, smoothed. Read by the stage every frame; never stored in React state. */
  const levelRef = useRef(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const accumulatedRef = useRef(0)
  const startedAtRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const limitRef = useRef(onLimitReached)
  useEffect(() => {
    limitRef.current = onLimitReached
  }, [onLimitReached])

  const currentElapsed = () =>
    accumulatedRef.current + (startedAtRef.current ? (performance.now() - startedAtRef.current) / 1000 : 0)

  const stopMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    levelRef.current = 0
  }

  const teardown = useCallback(() => {
    stopMeter()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    recorderRef.current = null
    startedAtRef.current = null
  }, [])

  const freezeClock = () => {
    accumulatedRef.current = currentElapsed()
    startedAtRef.current = null
    setElapsed(accumulatedRef.current)
  }

  const pause = useCallback((reason: Interruption = null) => {
    const rec = recorderRef.current
    if (!rec || rec.state !== 'recording') return
    rec.requestData()
    rec.pause()
    freezeClock()
    stopMeter()
    setInterruption(reason)
    setState('paused')
  }, [])

  const startMeter = (analyser: AnalyserNode) => {
    const buf = new Float32Array(analyser.fftSize)
    const tick = () => {
      analyser.getFloatTimeDomainData(buf)
      let sum = 0
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
      const rms = Math.sqrt(sum / buf.length)
      // Speech RMS sits roughly 0.01–0.2; map onto 0–1 with a soft knee.
      const target = Math.min(1, Math.pow(rms * 6, 0.7))
      const prev = levelRef.current
      // Rise a little faster than fall, so the light follows speech and settles gently.
      levelRef.current = prev + (target - prev) * (target > prev ? 0.22 : 0.08)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const start = useCallback(async () => {
    if (!recordingSupported()) {
      setState('unsupported')
      return
    }
    setState('requesting')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      setState(name === 'NotFoundError' || name === 'OverconstrainedError' ? 'no-mic' : 'denied')
      return
    }

    streamRef.current = stream
    chunksRef.current = []
    accumulatedRef.current = 0
    setElapsed(0)
    setInterruption(null)

    const mimeType = pickMime()
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorderRef.current = rec

    // If another app takes the mic (a phone call), keep what we have.
    stream.getAudioTracks().forEach((track) => {
      track.onended = () => {
        if (recorderRef.current?.state === 'recording') {
          freezeClock()
          stopMeter()
        }
        setInterruption('mic-lost')
        setState('paused')
      }
    })

    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      ctx.createMediaStreamSource(stream).connect(analyser)
      audioCtxRef.current = ctx
      startMeter(analyser)
    } catch {
      // The level is decoration over a working recording; never block on it.
    }

    rec.start(1000)
    startedAtRef.current = performance.now()
    setState('recording')
  }, [])

  const resume = useCallback(() => {
    const rec = recorderRef.current
    if (!rec || rec.state !== 'paused' || interruption === 'mic-lost') return
    rec.resume()
    startedAtRef.current = performance.now()
    setInterruption(null)
    setState('recording')
    const ctx = audioCtxRef.current
    if (ctx && streamRef.current) {
      ctx.resume().catch(() => {})
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      ctx.createMediaStreamSource(streamRef.current).connect(analyser)
      startMeter(analyser)
    }
  }, [interruption])

  /** Finish and hand back the audio. Resolves null if nothing was captured. */
  const stop = useCallback(async (): Promise<{ blob: Blob; seconds: number } | null> => {
    const rec = recorderRef.current
    const seconds = currentElapsed()
    if (rec && rec.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        rec.addEventListener('stop', () => resolve(), { once: true })
        rec.stop()
      })
    }
    const type = rec?.mimeType || chunksRef.current[0]?.type || 'audio/webm'
    const blob = new Blob(chunksRef.current, { type })
    teardown()
    chunksRef.current = []
    accumulatedRef.current = 0
    setInterruption(null)
    setState('idle')
    return blob.size > 0 ? { blob, seconds } : null
  }, [teardown])

  const discard = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
    teardown()
    chunksRef.current = []
    accumulatedRef.current = 0
    setElapsed(0)
    setInterruption(null)
    setState('idle')
  }, [teardown])

  /** Back to idle after a permission problem, so the user can try again. */
  const reset = useCallback(() => setState(recordingSupported() ? 'idle' : 'unsupported'), [])

  // Clock + hard cap.
  useEffect(() => {
    if (state !== 'recording') return
    const id = window.setInterval(() => {
      const s = currentElapsed()
      setElapsed(s)
      if (s >= maxSeconds) limitRef.current()
    }, 250)
    return () => window.clearInterval(id)
  }, [state, maxSeconds])

  // Locking the screen or switching apps pauses instead of losing audio.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') pause('screen-locked')
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [pause])

  useEffect(() => teardown, [teardown])

  return { state, elapsed, interruption, levelRef, start, pause: () => pause(null), resume, stop, discard, reset }
}
