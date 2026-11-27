export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function timeOfDay(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function dayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export const PROMPTS = [
  'What stayed with you today?',
  'What took the most out of you?',
  'What’s one moment you’d keep?',
  'What’s still on your mind?',
  'What surprised you today?',
  'How does your body feel right now?',
  'Who did you think about today?',
  'What would you tell this morning’s you?',
]
