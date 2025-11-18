export type ExportFormat = 'json' | 'markdown' | 'csv' | 'pdf'

export interface ExportOptions {
  format: ExportFormat
  includeOptions?: boolean
  includeLinks?: boolean
  includeComments?: boolean
  includeHistory?: boolean
}

export interface ExportResult {
  content: string | Buffer
  mimeType: string
  filename: string
}

export interface IExportAdapter {
  export(decisionId: string, options: ExportOptions): Promise<ExportResult>
  exportMultiple(decisionIds: string[], options: ExportOptions): Promise<ExportResult>
}

// Stub implementation
export class ExportAdapter implements IExportAdapter {
  async export(decisionId: string, options: ExportOptions): Promise<ExportResult> {
    console.log(`EXPORT: ${decisionId}`, options)
    
    // Stub: return basic JSON
    return {
      content: JSON.stringify({ decisionId, options }, null, 2),
      mimeType: 'application/json',
      filename: `decision-${decisionId}.${options.format}`,
    }
  }

  async exportMultiple(decisionIds: string[], options: ExportOptions): Promise<ExportResult> {
    console.log(`EXPORT MULTIPLE:`, decisionIds, options)
    
    return {
      content: JSON.stringify({ decisionIds, options }, null, 2),
      mimeType: 'application/json',
      filename: `decisions-export.${options.format}`,
    }
  }
}

export const exportAdapter: IExportAdapter = new ExportAdapter()
