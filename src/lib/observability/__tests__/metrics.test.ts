import { describe, it, expect, beforeEach } from 'vitest'
import { metrics } from '../metrics'

describe('Metrics', () => {
  beforeEach(() => {
    metrics.reset()
  })

  it('should increment counters', () => {
    metrics.counter('test.counter', 1)
    metrics.counter('test.counter', 2)

    const counters = metrics.getCounters()
    expect(counters.get('test.counter')).toBe(3)
  })

  it('should record histograms', () => {
    metrics.histogram('test.histogram', 100)
    metrics.histogram('test.histogram', 200)

    const histograms = metrics.getHistograms()
    const values = histograms.get('test.histogram')
    expect(values).toEqual([100, 200])
  })

  it('should support labels', () => {
    metrics.counter('requests', 1, { method: 'GET', status: 200 })

    const counters = metrics.getCounters()
    expect(counters.get('requests{method=GET,status=200}')).toBe(1)
  })
})
