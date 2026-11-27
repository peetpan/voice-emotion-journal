/**
 * Emotion → gel mapping and the soft-word vocabulary for confidence.
 *
 * The label set is provisional until the speech and text emotion models are
 * chosen. Unknown labels from the server still render, on the neutral gel.
 */

export type Gel = {
  /** The colour's swatch-book name. */
  gel: string
  color: string
  /** "Sounds mostly ___" */
  adjective: string
  /** "with a little ___" */
  noun: string
}

const GELS: Record<string, Gel> = {
  calm: { gel: 'Sea green', color: 'var(--gel-sea)', adjective: 'calm', noun: 'calm' },
  joy: { gel: 'Amber', color: 'var(--gel-amber)', adjective: 'bright', noun: 'joy' },
  sadness: { gel: 'Steel blue', color: 'var(--gel-steel)', adjective: 'low', noun: 'sadness' },
  worry: { gel: 'Violet', color: 'var(--gel-violet)', adjective: 'uneasy', noun: 'worry' },
  frustration: { gel: 'Rose', color: 'var(--gel-rose)', adjective: 'frustrated', noun: 'frustration' },
  tiredness: { gel: 'Straw', color: 'var(--gel-straw)', adjective: 'tired', noun: 'tiredness' },
}

const NEUTRAL: Omit<Gel, 'adjective' | 'noun'> = { gel: 'Open white', color: 'var(--gel-open)' }

export function gelFor(label: string): Gel {
  const key = label.trim().toLowerCase()
  return GELS[key] ?? { ...NEUTRAL, adjective: key, noun: key }
}

/** Display name for an emotion label, sentence case. */
export function emotionName(label: string): string {
  const noun = gelFor(label).noun
  return noun.charAt(0).toUpperCase() + noun.slice(1)
}

/**
 * Confidence is never shown as a number: the analysis is a signal to sit
 * with, not a measurement of the person.
 */
export function strengthWord(confidence: number): string {
  if (confidence >= 0.6) return 'strong'
  if (confidence >= 0.35) return 'clear'
  if (confidence >= 0.18) return 'a little'
  return 'faint'
}

function amountPhrase(confidence: number): string {
  if (confidence >= 0.35) return 'some'
  if (confidence >= 0.18) return 'a little'
  return 'a trace of'
}

export type EmotionSignal = { label: string; confidence: number }

/** "Sounds mostly calm, with a little tiredness and a trace of worry." */
export function readingSentence(emotions: EmotionSignal[]): string {
  if (emotions.length === 0) return 'No clear feeling came through this time.'
  const [primary, ...rest] = emotions
  const lead = primary.confidence >= 0.45 ? 'mostly' : 'a little'
  const head = `Sounds ${lead} ${gelFor(primary.label).adjective}`
  const tail = rest.slice(0, 2).map((e) => `${amountPhrase(e.confidence)} ${gelFor(e.label).noun}`)
  if (tail.length === 0) return `${head}.`
  return `${head}, with ${tail.join(' and ')}.`
}
