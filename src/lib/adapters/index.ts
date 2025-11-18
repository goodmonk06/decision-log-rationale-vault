export * from './notification'
export * from './search'
export * from './export'

// Registry for swapping implementations
export interface AdapterRegistry {
  notification: any
  search: any
  export: any
}

let registry: Partial<AdapterRegistry> = {}

export function registerAdapter<K extends keyof AdapterRegistry>(
  type: K,
  adapter: AdapterRegistry[K]
) {
  registry[type] = adapter
}

export function getAdapter<K extends keyof AdapterRegistry>(
  type: K
): AdapterRegistry[K] | undefined {
  return registry[type]
}

export function resetAdapters() {
  registry = {}
}
