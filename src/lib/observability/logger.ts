type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private context: LogContext = {}

  constructor(defaultContext?: LogContext) {
    if (defaultContext) {
      this.context = defaultContext
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const mergedContext = { ...this.context, ...context }
    
    const logEntry = {
      timestamp,
      level,
      message,
      ...mergedContext,
    }

    const logString = JSON.stringify(logEntry)

    switch (level) {
      case 'error':
        console.error(logString)
        break
      case 'warn':
        console.warn(logString)
        break
      case 'debug':
        if (process.env.NODE_ENV !== 'production') {
          console.debug(logString)
        }
        break
      default:
        console.log(logString)
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext: LogContext = { ...context }
    
    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } else if (error) {
      errorContext.error = error
    }

    this.log('error', message, errorContext)
  }

  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context })
  }
}

export const logger = new Logger({
  service: 'decision-vault',
  environment: process.env.NODE_ENV || 'development',
})

export function createRequestLogger(requestId: string, path: string): Logger {
  return logger.child({ requestId, path })
}

export default logger
