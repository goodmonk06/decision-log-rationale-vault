# Architecture

## Overview

The Decision Log Rationale Vault is built as a layered, event-driven system designed for extensibility and integration into larger ecosystems.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  (Next.js Pages, External API Consumers)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                     API Layer                                │
│  /api/decisions, /api/tags, /api/comments, etc.             │
│  - Request validation (Zod)                                  │
│  - Error handling                                            │
│  - Logging & metrics                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                   Service Layer                              │
│  - Decision service                                          │
│  - Tag service                                               │
│  - Comment service                                           │
│  - History service                                           │
│  - Event emission                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                    Domain Layer                              │
│  - Business logic                                            │
│  - Validation rules                                          │
│  - Domain events                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                 Data Access Layer                            │
│  - Prisma ORM                                                │
│  - Type-safe database access                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                    PostgreSQL                                │
│  - Decisions, Options, Links                                 │
│  - Tags, Comments, History                                   │
│  - Users, Templates                                          │
└──────────────────────────────────────────────────────────────┘
```

## Cross-Cutting Concerns

```
┌─────────────────────────────────────────────────────────────┐
│                   Observability                              │
│  ┌─────────────┬──────────────┬─────────────────┐           │
│  │   Logging   │   Metrics    │   Events        │           │
│  │  (Structured)│ (Counters,   │  (Domain Events)│           │
│  │             │  Histograms) │                 │           │
│  └─────────────┴──────────────┴─────────────────┘           │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Extension Points                              │
│  ┌──────────────────┬──────────────────┬──────────────────┐ │
│  │  Notification    │  Search          │  Export          │ │
│  │  Adapter         │  Adapter         │  Adapter         │ │
│  └──────────────────┴──────────────────┴──────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating a Decision with Tags and Comments

```
User Request
    │
    ▼
POST /api/decisions
    │
    ├──> Validate input (Zod)
    │
    ├──> Create decision (Prisma)
    │
    ├──> Emit DecisionCreated event
    │      │
    │      ├──> Log to console
    │      ├──> Record metric
    │      └──> Trigger notification (adapter)
    │
    ├──> Create tags if provided
    │      │
    │      └──> Emit TagAssigned events
    │
    └──> Return response
```

## Component Breakdown

### Core Entities

1. **Decision**: Central entity representing a decision
   - Has many options
   - Has many links
   - Has many tags (via join table)
   - Has many comments
   - Has change history

2. **DecisionOption**: Alternative considered for a decision
   - Pros and cons in markdown
   - Chosen indicator

3. **DecisionLink**: Link to external entity
   - Projects, people, repositories, etc.
   - Flexible metadata via JSON

4. **Tag**: Organizational label
   - Many-to-many with decisions
   - Enables filtering and discovery

5. **DecisionComment**: Discussion thread
   - Nested replies support
   - User attribution

6. **DecisionHistory**: Audit trail
   - Tracks all changes
   - Who, what, when

7. **User**: Decision makers and participants
   - Creates decisions
   - Writes comments
   - Makes changes

## Extension Architecture

### Adapter Pattern

All external integrations use adapters that implement interfaces:

```typescript
interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<void>
}

interface ISearchAdapter {
  search(query: SearchQuery): Promise<SearchResult[]>
}

interface IExportAdapter {
  export(decisionId: string, options: ExportOptions): Promise<ExportResult>
}
```

Adapters can be swapped at runtime:

```typescript
import { registerAdapter } from '@/lib/adapters'
import { ElasticsearchAdapter } from './my-search-adapter'

registerAdapter('search', new ElasticsearchAdapter())
```

### Event-Driven Architecture

Domain events enable reactive workflows:

```typescript
import { eventEmitter } from '@/lib/events'

// Subscribe to events
eventEmitter.on('decision.created', async (event) => {
  await notifyStakeholders(event.payload.decisionId)
  await indexInSearch(event.payload)
})

// Events are emitted by services
await eventEmitter.emit({
  id: 'evt_123',
  type: 'decision.created',
  timestamp: new Date(),
  payload: { decisionId, title, status },
})
```

## Scalability Considerations

1. **Database**: PostgreSQL with proper indexing
   - Indexes on foreign keys
   - Indexes on frequently queried fields (status, tags, decidedAt)
   - Full-text search via `ts_vector` (future enhancement)

2. **Caching**: Ready for Redis integration
   - Cache decisions by ID
   - Cache tag lists
   - Invalidate on updates

3. **Search**: Pluggable search backend
   - Start with PostgreSQL FTS
   - Upgrade to Elasticsearch when needed

4. **Event Processing**: Currently synchronous
   - Can be upgraded to message queue (RabbitMQ, Kafka)
   - Enables async workflows and retries

## Security

1. **Input Validation**: All inputs validated with Zod
2. **SQL Injection**: Prisma parameterizes all queries
3. **XSS Protection**: React escapes output by default
4. **CORS**: Configure for production domains
5. **Rate Limiting**: Add via middleware (future)
6. **Authentication**: Integrate with your auth system

## Monitoring & Observability

### Structured Logging

All logs are JSON with:
- Timestamp
- Level (debug, info, warn, error)
- Message
- Context (requestId, userId, decisionId, etc.)

### Metrics

Track key business metrics:
- `decisions.created`
- `decisions.updated`
- `tags.assigned`
- `comments.created`
- `api.response_time`

### Events

Domain events provide audit trail and enable:
- Analytics
- Notifications
- Workflow automation
- External system integration

## Testing Strategy

1. **Unit Tests**: Services, validation, utils
2. **Integration Tests**: API endpoints with real DB
3. **E2E Tests**: Full user workflows
4. **Contract Tests**: API contracts for consumers

## Deployment

### Docker

```bash
docker compose up
```

Includes:
- Next.js app (port 3000)
- PostgreSQL (port 5432)

### Environment Variables

```
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Database Migrations

```bash
npm run db:migrate:deploy
npm run db:seed
```

## Future Enhancements

1. **GraphQL API**: Flexible querying for complex UIs
2. **Real-time subscriptions**: WebSocket support for live updates
3. **Advanced search**: Elasticsearch integration
4. **Workflow engine**: Approval processes for decisions
5. **Integrations**: Slack, Teams, JIRA, etc.
6. **Analytics dashboard**: Decision metrics and insights
7. **AI insights**: Summarize decisions, suggest related decisions
