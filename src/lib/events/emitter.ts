import { DomainEvent, DomainEventType } from './types'
import { logger } from '../observability/logger'
import { metrics } from '../observability/metrics'

type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>

class EventEmitter {
  private handlers: Map<DomainEventType, EventHandler[]> = new Map()

  on<T extends DomainEvent>(eventType: DomainEventType, handler: EventHandler<T>) {
    const handlers = this.handlers.get(eventType) || []
    handlers.push(handler as EventHandler)
    this.handlers.set(eventType, handlers)
  }

  off(eventType: DomainEventType, handler: EventHandler) {
    const handlers = this.handlers.get(eventType) || []
    const filtered = handlers.filter(h => h !== handler)
    this.handlers.set(eventType, filtered)
  }

  async emit(event: DomainEvent) {
    logger.debug('Event emitted', { eventType: event.type, eventId: event.id })
    metrics.counter('domain.events', 1, { type: event.type })

    const handlers = this.handlers.get(event.type) || []
    
    for (const handler of handlers) {
      try {
        await handler(event)
      } catch (error) {
        logger.error('Event handler failed', error, {
          eventType: event.type,
          eventId: event.id,
        })
      }
    }
  }

  clear() {
    this.handlers.clear()
  }
}

export const eventEmitter = new EventEmitter()

// Example handler registration (can be extended)
eventEmitter.on('decision.created', async (event) => {
  const typedEvent = event as import('./types').DecisionCreatedEvent
  logger.info('New decision created', {
    decisionId: typedEvent.payload.decisionId,
    title: typedEvent.payload.title,
  })
})

export default eventEmitter
