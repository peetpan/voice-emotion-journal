import type { EmotionSignal } from './emotions'

/**
 * The journal server (FastAPI, self-hosted). Audio goes only here; there are
 * no third-party calls. With no VITE_API_URL set, the app runs in sample mode
 * and says so on screen.
 */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')

export const sampleMode = !API_URL

export type Analysis = {
  id: string
  recordedAt: string
  transcript: string
  /** Sorted strongest first. */
  emotions: EmotionSignal[]
  /** -1 (unpleasant) … 1 (pleasant) */
  valence: number
  /** 0 (low) … 1 (high) */
  energy: number
  /** True when produced by sample mode rather than the real pipeline. */
  sample?: boolean
}

export class ServerUnavailable extends Error {}

export async function analyzeEntry(audio: Blob, recordedAt: Date, signal?: AbortSignal): Promise<Analysis> {
  if (!API_URL) return sampleAnalysis(recordedAt, signal)

  const ext = audio.type.includes('mp4') ? 'm4a' : audio.type.includes('ogg') ? 'ogg' : 'webm'
  const body = new FormData()
  body.append('audio', audio, `entry.${ext}`)
  body.append('recorded_at', recordedAt.toISOString())

  let res: Response
  try {
    res = await fetch(`${API_URL}/entries`, { method: 'POST', body, signal })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ServerUnavailable('unreachable')
  }
  if (!res.ok) throw new ServerUnavailable(`status ${res.status}`)
  const data = (await res.json()) as Analysis
  data.emotions = [...data.emotions].sort((a, b) => b.confidence - a.confidence)
  return data
}

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

/** Clearly-labelled sample output so the screen can be used before the server exists. */
async function sampleAnalysis(recordedAt: Date, signal?: AbortSignal): Promise<Analysis> {
  await wait(2600, signal)
  if (new URLSearchParams(location.search).get('sample') === 'fail') throw new ServerUnavailable('sample failure')
  return {
    id: `sample-${recordedAt.getTime()}`,
    recordedAt: recordedAt.toISOString(),
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
}
