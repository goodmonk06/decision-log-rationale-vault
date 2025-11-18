export interface SearchQuery {
  query: string
  filters?: {
    status?: string[]
    tags?: string[]
    createdBy?: string[]
    dateFrom?: Date
    dateTo?: Date
  }
  limit?: number
  offset?: number
}

export interface SearchResult {
  id: string
  title: string
  snippet: string
  score: number
  metadata?: Record<string, any>
}

export interface ISearchAdapter {
  index(id: string, document: Record<string, any>): Promise<void>
  search(query: SearchQuery): Promise<SearchResult[]>
  delete(id: string): Promise<void>
  reindex(): Promise<void>
}

// Stub implementation using PostgreSQL full-text search
export class PostgresSearchAdapter implements ISearchAdapter {
  async index(id: string, document: Record<string, any>): Promise<void> {
    console.log(`INDEX: ${id}`, document)
    // In production, this would update a search index table or trigger FTS reindex
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    console.log('SEARCH:', query)
    // Stub: in production, this would query PostgreSQL FTS or external search engine
    return []
  }

  async delete(id: string): Promise<void> {
    console.log(`DELETE INDEX: ${id}`)
  }

  async reindex(): Promise<void> {
    console.log('REINDEX ALL')
  }
}

export const searchAdapter: ISearchAdapter = new PostgresSearchAdapter()
