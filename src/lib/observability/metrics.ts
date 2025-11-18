interface MetricLabels {
  [key: string]: string | number | boolean
}

class Metrics {
  private counters: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()

  counter(name: string, value: number = 1, labels?: MetricLabels) {
    const key = this.getKey(name, labels)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + value)

    // Log metric for observability
    console.log(JSON.stringify({
      type: 'metric',
      metricType: 'counter',
      name,
      value: current + value,
      labels,
      timestamp: new Date().toISOString(),
    }))
  }

  histogram(name: string, value: number, labels?: MetricLabels) {
    const key = this.getKey(name, labels)
    const values = this.histograms.get(key) || []
    values.push(value)
    this.histograms.set(key, values)

    // Log metric
    console.log(JSON.stringify({
      type: 'metric',
      metricType: 'histogram',
      name,
      value,
      labels,
      timestamp: new Date().toISOString(),
    }))
  }

  timing(name: string, durationMs: number, labels?: MetricLabels) {
    this.histogram(name, durationMs, labels)
  }

  private getKey(name: string, labels?: MetricLabels): string {
    if (!labels) return name
    const labelPairs = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join(',')
    return `${name}{${labelPairs}}`
  }

  getCounters(): Map<string, number> {
    return new Map(this.counters)
  }

  getHistograms(): Map<string, number[]> {
    return new Map(this.histograms)
  }

  reset() {
    this.counters.clear()
    this.histograms.clear()
  }
}

export const metrics = new Metrics()

export function measureTime<T>(
  metricName: string,
  fn: () => T | Promise<T>,
  labels?: MetricLabels
): Promise<T> {
  const start = Date.now()
  const result = fn()

  if (result instanceof Promise) {
    return result.then((r) => {
      metrics.timing(metricName, Date.now() - start, labels)
      return r
    })
  }

  metrics.timing(metricName, Date.now() - start, labels)
  return Promise.resolve(result)
}

export default metrics
