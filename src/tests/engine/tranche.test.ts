import { describe, it, expect } from 'vitest'
import { buildTranchePlan } from '@/lib/engine/tranche'

describe('buildTranchePlan', () => {
  it('activates when Momentum=Weak and Regime=Neutral', () => {
    const plan = buildTranchePlan('Weak', 'Neutral')
    expect(plan.trancheActive).toBe(true)
  })

  it('activates when Momentum=Weak and Regime=Risk OFF', () => {
    const plan = buildTranchePlan('Weak', 'Risk OFF')
    expect(plan.trancheActive).toBe(true)
  })

  it('does NOT activate when Momentum=Weak but Regime=Risk ON', () => {
    const plan = buildTranchePlan('Weak', 'Risk ON')
    expect(plan.trancheActive).toBe(false)
    expect(plan.entries).toHaveLength(0)
  })

  it('does NOT activate when Momentum=Strong', () => {
    const plan = buildTranchePlan('Strong', 'Neutral')
    expect(plan.trancheActive).toBe(false)
  })

  it('does NOT activate when Momentum=Neutral', () => {
    const plan = buildTranchePlan('Neutral', 'Neutral')
    expect(plan.trancheActive).toBe(false)
  })

  it('returns 4 entries when active', () => {
    const plan = buildTranchePlan('Weak', 'Neutral')
    expect(plan.entries).toHaveLength(4)
  })

  it('sets tranche 1 as active', () => {
    const plan = buildTranchePlan('Weak', 'Neutral')
    expect(plan.entries[0]?.status).toBe('active')
  })

  it('sets tranches 2–4 as pending', () => {
    const plan = buildTranchePlan('Weak', 'Neutral')
    expect(plan.entries[1]?.status).toBe('pending')
    expect(plan.entries[2]?.status).toBe('pending')
    expect(plan.entries[3]?.status).toBe('pending')
  })

  it('includes reason string when active', () => {
    const plan = buildTranchePlan('Weak', 'Risk OFF')
    expect(plan.reason).toContain('Weak')
    expect(plan.reason).toContain('Risk OFF')
  })

  it('has sequential tranche numbers 1–4', () => {
    const plan = buildTranchePlan('Weak', 'Neutral')
    const numbers = plan.entries.map((e) => e.tranche)
    expect(numbers).toEqual([1, 2, 3, 4])
  })
})
