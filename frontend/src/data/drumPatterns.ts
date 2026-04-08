import type { DrumInstrument } from '../audio/drumSamples'

/**
 * Drum pattern data.
 *
 * Each pattern has a `steps` array per instrument.
 * `1` = play, `0` = silent.
 * Steps are 16th-note resolution:
 *   4/4 → 16 steps (4 beats × 4 subdivisions)
 *   3/4 → 12 steps (3 beats × 4 subdivisions)
 *   6/8 → 12 steps (2 main beats × 6 subdivisions each, but 12 total 8th-triplet steps)
 *   5/4 → 20 steps (5 beats × 4 subdivisions)
 *   7/8 → 14 steps (7 beats × 2 subdivisions)
 */

export interface DrumPattern {
  name: string
  style: string
  steps: Record<DrumInstrument, number[]>
}

export interface TimeSignaturePatterns {
  numerator: number
  denominator: number
  stepsPerBar: number
  patterns: DrumPattern[]
}

// ─── 4/4 Patterns (16 steps) ─────────────────────────────────────────────────

const patterns_4_4: DrumPattern[] = [
  {
    name: 'Basic Rock',
    style: 'Rock',
    steps: {
      kick:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    name: 'Funk Groove',
    style: 'Funk',
    steps: {
      kick:    [1,0,0,0, 0,1,0,0, 1,0,0,0, 0,0,1,0],
      snare:   [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
      hihat_c: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
      hihat_o: [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    name: 'Jazz Ride',
    style: 'Jazz',
    steps: {
      kick:    [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      snare:   [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
      hihat_c: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride:    [1,0,1,0, 0,1,0,0, 1,0,1,0, 0,1,0,0],
      crash:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    name: 'Four on Floor',
    style: 'Pop/Dance',
    steps: {
      kick:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
      snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      hihat_o: [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    name: 'Shuffle',
    style: 'Blues Shuffle',
    steps: {
      kick:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,1,0,0],
      snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat_c: [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,1],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
]

// ─── 3/4 Patterns (12 steps) ─────────────────────────────────────────────────

const patterns_3_4: DrumPattern[] = [
  {
    name: 'Classic Waltz',
    style: 'Waltz',
    steps: {
      kick:    [1,0,0,0, 0,0,0,0, 0,0,0,0],
      snare:   [0,0,0,0, 0,0,1,0, 1,0,0,0],
      hihat_c: [0,0,1,0, 1,0,0,0, 1,0,0,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    name: 'Jazz Waltz',
    style: 'Jazz',
    steps: {
      kick:    [1,0,0,0, 0,0,0,0, 0,0,0,0],
      snare:   [0,0,0,0, 0,0,0,1, 0,0,0,0],
      hihat_c: [0,0,0,0, 1,0,0,0, 1,0,0,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride:    [1,0,0,1, 0,0,1,0, 0,1,0,0],
      crash:   [0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    name: 'Rock Waltz',
    style: 'Rock',
    steps: {
      kick:    [1,0,0,0, 0,0,0,0, 0,0,0,0],
      snare:   [0,0,0,0, 1,0,0,0, 1,0,0,0],
      hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,1,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
]

// ─── 6/8 Patterns (12 steps = 6 eighth-notes) ────────────────────────────────

const patterns_6_8: DrumPattern[] = [
  {
    name: '6/8 Ballad',
    style: 'Ballad',
    steps: {
      kick:    [1,0,0,0, 0,0,1,0, 0,0,0,0],
      snare:   [0,0,0,1, 0,0,0,0, 0,1,0,0],
      hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    name: '6/8 Rock',
    style: 'Rock',
    steps: {
      kick:    [1,0,0,0, 0,0,0,0, 0,0,0,0],
      snare:   [0,0,0,1, 0,0,0,0, 0,1,0,0],
      hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0],
      hihat_o: [0,0,0,0, 0,1,0,0, 0,0,0,1],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    name: '6/8 Celtic',
    style: 'Celtic',
    steps: {
      kick:    [1,0,0,0, 0,0,1,0, 0,0,0,0],
      snare:   [0,0,0,0, 1,0,0,0, 1,0,0,0],
      hihat_c: [0,0,0,0, 0,0,0,0, 0,0,0,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride:    [1,0,1,0, 1,0,1,0, 1,0,1,0],
      crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
]

// ─── 5/4 Patterns (20 steps) ─────────────────────────────────────────────────

const patterns_5_4: DrumPattern[] = [
  {
    name: 'Take Five (2+3)',
    style: 'Jazz',
    steps: {
      kick:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0],
      snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
  {
    name: 'Mission (3+2)',
    style: 'Rock',
    steps: {
      kick:    [1,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
      snare:   [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
      hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
      crash:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    },
  },
]

// ─── 7/8 Patterns (14 steps) ─────────────────────────────────────────────────

const patterns_7_8: DrumPattern[] = [
  {
    name: 'Balkan 3+2+2',
    style: 'Balkan',
    steps: {
      kick:    [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0],
      snare:   [0,0,0,1, 0,0,0,0, 1,0,0,0, 1,0],
      hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0],
      crash:   [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0],
    },
  },
  {
    name: 'Progressive 2+2+3',
    style: 'Progressive',
    steps: {
      kick:    [1,0,0,0, 1,0,0,0, 1,0,0,0, 0,0],
      snare:   [0,0,1,0, 0,0,1,0, 0,0,0,1, 0,0],
      hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0],
      hihat_o: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0],
      ride:    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0],
      crash:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0],
    },
  },
]

// ─── Registry ────────────────────────────────────────────────────────────────

export const ALL_PATTERNS: TimeSignaturePatterns[] = [
  { numerator: 4, denominator: 4, stepsPerBar: 16, patterns: patterns_4_4 },
  { numerator: 3, denominator: 4, stepsPerBar: 12, patterns: patterns_3_4 },
  { numerator: 6, denominator: 8, stepsPerBar: 12, patterns: patterns_6_8 },
  { numerator: 5, denominator: 4, stepsPerBar: 20, patterns: patterns_5_4 },
  { numerator: 7, denominator: 8, stepsPerBar: 14, patterns: patterns_7_8 },
  // 2/4 uses same 16-step patterns as 4/4 (plays 2 beats = first half)
  { numerator: 2, denominator: 4, stepsPerBar: 16, patterns: patterns_4_4 },
]

export function getPatternsForMeter(numerator: number, denominator: number): TimeSignaturePatterns {
  const found = ALL_PATTERNS.find(
    (p) => p.numerator === numerator && p.denominator === denominator
  )
  return found ?? ALL_PATTERNS[0] // Default to 4/4
}

export function getDefaultPatternName(numerator: number, denominator: number): string {
  const ts = getPatternsForMeter(numerator, denominator)
  return ts.patterns[0]?.name ?? 'Basic Rock'
}
