/**
 * Small local helpers.
 * - Pending audio lives in IndexedDB until the server confirms it, so a failed
 *   upload or a closed tab never loses a recording.
 * - Tonight's saved times live in localStorage purely for the status line;
 *   the server is the record.
 */

const DB = 'voice-emotion-journal'
const STORE = 'pending'

export type PendingEntry = { id: string; recordedAt: string; seconds: number; audio: Blob }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const req = run(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function savePending(entry: PendingEntry): Promise<void> {
  try {
    await tx('readwrite', (s) => s.put(entry))
  } catch {
    // Storage can be unavailable (private mode). The in-memory copy still exists.
  }
}

export async function deletePending(id: string): Promise<void> {
  try {
    await tx('readwrite', (s) => s.delete(id))
  } catch {
    /* nothing stored */
  }
}

export async function oldestPending(): Promise<PendingEntry | null> {
  try {
    const all = await tx<PendingEntry[]>('readonly', (s) => s.getAll())
    return all.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))[0] ?? null
  } catch {
    return null
  }
}

/** The journal's day turns over at 4am, so a 1am entry still belongs to "tonight". */
const DAY_TURNS_AT = 4

export function journalDay(now = new Date()): Date {
  const d = new Date(now)
  if (d.getHours() < DAY_TURNS_AT) d.setDate(d.getDate() - 1)
  d.setHours(0, 0, 0, 0)
  return d
}

const SAVED_KEY = 'vej.saved-times'

export function savedTonight(now = new Date()): Date[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]') as string[]
    const day = journalDay(now).getTime()
    return raw.map((s) => new Date(s)).filter((d) => journalDay(d).getTime() === day)
  } catch {
    return []
  }
}

export function rememberSaved(at: Date): void {
  try {
    const keep = savedTonight(at).map((d) => d.toISOString())
    localStorage.setItem(SAVED_KEY, JSON.stringify([...keep, at.toISOString()]))
  } catch {
    /* status line only */
  }
}
