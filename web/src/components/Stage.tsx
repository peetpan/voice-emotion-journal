import { useEffect, useRef, useState, type RefObject } from 'react'
import { gelFor, type EmotionSignal } from '../lib/emotions'

export type StageMode = 'idle' | 'live' | 'paused' | 'listening' | 'resolved'

type Props = {
  mode: StageMode
  /** 0–1 voice level, read every frame while live. */
  levelRef?: RefObject<number>
  /** Fixed level, for previews. */
  level?: number
  emotions?: EmotionSignal[]
}

/**
 * Fixed rig positions (percent of the square stage), so every night's gels
 * sit at the same scale and place and any two nights compare by eye.
 */
const SLOTS: Array<[x: number, y: number]> = [
  [44, 46],
  [64, 38],
  [58, 64],
  [32, 64],
  [72, 60],
  [30, 32],
]

/** Diameter (percent of stage) from confidence. Same formula every night. */
const diameter = (c: number) => 30 + 56 * Math.min(1, Math.max(0, c))
const density = (c: number) => 0.42 + 0.5 * Math.min(1, Math.max(0, c))

function prefersReducedMotion() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function Stage({ mode, levelRef, level, emotions = [] }: Props) {
  const rigRef = useRef<HTMLDivElement>(null)
  const [settled, setSettled] = useState(mode !== 'resolved')

  // The voice is the only live driver of the stage.
  useEffect(() => {
    const rig = rigRef.current
    if (!rig) return
    if (mode !== 'live') {
      rig.style.setProperty('--lvl', String(level ?? 0))
      return
    }
    const reduce = prefersReducedMotion()
    let raf = 0
    const tick = () => {
      let v = level ?? levelRef?.current ?? 0
      if (reduce) v = Math.round(v * 4) / 4
      rig.style.setProperty('--lvl', v.toFixed(3))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mode, level, levelRef])

  // Gels gather at the light's centre, then move out to their places.
  useEffect(() => {
    if (mode !== 'resolved') return
    setSettled(false)
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setSettled(true)))
    return () => cancelAnimationFrame(raf)
  }, [mode])

  const gels = emotions.slice(0, SLOTS.length)

  return (
    <div className="rig-wrap" aria-hidden="true">
    <div className="rig" ref={rigRef} data-mode={mode}>
      <svg className="mark" viewBox="0 0 100 100" preserveAspectRatio="none" vectorEffect="non-scaling-stroke">
        {/* centre cross and two edge T-marks, laid like spike tape on a stage floor */}
        <path d="M47.5 68h5M50 65.5v5" vectorEffect="non-scaling-stroke" />
        <path d="M15 68h5M17.5 68v3" vectorEffect="non-scaling-stroke" />
        <path d="M80 68h5M82.5 68v3" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="beam" />
      <div className="pool" />
      {mode === 'resolved' &&
        gels.map((e, i) => {
          const [x, y] = SLOTS[i]
          const d = diameter(e.confidence)
          return (
            <div
              key={e.label}
              className="gel"
              data-settled={settled}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${d}%`,
                height: `${d}%`,
                ['--gel' as string]: gelFor(e.label).color,
                ['--density' as string]: density(e.confidence),
                ['--from-x' as string]: `${50 - x}cqw`,
                ['--from-y' as string]: `${50 - y}cqh`,
                transitionDelay: `${i * 90}ms`,
              }}
            />
          )
        })}
    </div>
    </div>
  )
}
