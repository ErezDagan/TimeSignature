import { describe, it, expect } from 'vitest'
import {
  ALL_PATTERNS,
  getPatternsForMeter,
  getDefaultPatternName,
} from '../data/drumPatterns'

const INSTRUMENTS = ['kick', 'snare', 'hihat_c', 'hihat_o', 'ride', 'crash']

describe('drumPatterns', () => {
  it('all patterns have correct step counts per time signature', () => {
    for (const ts of ALL_PATTERNS) {
      for (const pattern of ts.patterns) {
        for (const inst of INSTRUMENTS) {
          const steps = pattern.steps[inst as keyof typeof pattern.steps]
          expect(steps.length).toBe(ts.stepsPerBar)
        }
      }
    }
  })

  it('all step values are 0 or 1', () => {
    for (const ts of ALL_PATTERNS) {
      for (const pattern of ts.patterns) {
        for (const inst of INSTRUMENTS) {
          const steps = pattern.steps[inst as keyof typeof pattern.steps]
          for (const step of steps) {
            expect([0, 1]).toContain(step)
          }
        }
      }
    }
  })

  it('4/4 Basic Rock has kick on steps 0 and 8', () => {
    const ts = getPatternsForMeter(4, 4)
    const rock = ts.patterns.find((p) => p.name === 'Basic Rock')!
    expect(rock).toBeDefined()
    expect(rock.steps.kick[0]).toBe(1)
    expect(rock.steps.kick[8]).toBe(1)
    // No kick on beat 2 (step 4)
    expect(rock.steps.kick[4]).toBe(0)
  })

  it('3/4 has 12 steps', () => {
    const ts = getPatternsForMeter(3, 4)
    expect(ts.stepsPerBar).toBe(12)
    for (const p of ts.patterns) {
      expect(p.steps.kick.length).toBe(12)
    }
  })

  it('6/8 has 12 steps', () => {
    const ts = getPatternsForMeter(6, 8)
    expect(ts.stepsPerBar).toBe(12)
  })

  it('5/4 has 20 steps', () => {
    const ts = getPatternsForMeter(5, 4)
    expect(ts.stepsPerBar).toBe(20)
  })

  it('7/8 has 14 steps', () => {
    const ts = getPatternsForMeter(7, 8)
    expect(ts.stepsPerBar).toBe(14)
  })

  it('getPatternsForMeter defaults to 4/4 for unknown meter', () => {
    const ts = getPatternsForMeter(11, 8)
    expect(ts.numerator).toBe(4)
    expect(ts.denominator).toBe(4)
  })

  it('getDefaultPatternName returns first pattern name', () => {
    const name = getDefaultPatternName(4, 4)
    expect(name).toBe('Basic Rock')
  })
})
