import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, createRequestLogger } from '../logger'

describe('Logger', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('should log info messages', () => {
    logger.info('Test message', { key: 'value' })

    expect(consoleLogSpy).toHaveBeenCalled()
    const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
    expect(loggedData).toMatchObject({
      level: 'info',
      message: 'Test message',
      key: 'value',
      service: 'decision-vault',
    })
  })

  it('should create child loggers with context', () => {
    const requestLogger = createRequestLogger('req-123', '/api/decisions')
    requestLogger.info('Request received')

    expect(consoleLogSpy).toHaveBeenCalled()
    const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0])
    expect(loggedData).toMatchObject({
      requestId: 'req-123',
      path: '/api/decisions',
    })
  })
})
