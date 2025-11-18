# Decision Log Rationale Vault

> **Production-grade decision tracking and organizational knowledge management**

A comprehensive system for capturing, tracking, and exploring important technical and business decisions. Built to make past reasoning accessible, searchable, and actionable.

## Features

### Core Decision Management
- ✅ **Rich decision tracking** with markdown descriptions, status, and timestamps
- ✅ **Options framework** to document alternatives with pros/cons analysis
- ✅ **Entity linking** to connect decisions across projects, people, and repositories
- ✅ **Tag-based organization** for filtering and discovery
- ✅ **Threaded comments** for stakeholder discussions
- ✅ **Audit history** tracking all changes over time
- ✅ **User attribution** for accountability and context

### Developer Experience
- ✅ **Type-safe** end-to-end with TypeScript and Prisma
- ✅ **Validated inputs** using Zod schemas
- ✅ **Comprehensive error handling** with structured responses
- ✅ **Docker support** for easy local development and deployment
- ✅ **Full test coverage** with Vitest
- ✅ **Rich seed data** for immediate exploration

### Extensibility
- ✅ **Event-driven architecture** for reactive workflows
- ✅ **Adapter pattern** for pluggable integrations
- ✅ **Structured logging** and metrics
- ✅ **Clean extension points** for ecosystem integration

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd decision-log-rationale-vault

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Docker Quick Start

```bash
# Start everything with Docker
docker compose up

# In another terminal, seed the database
docker compose exec app npm run db:seed
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16 + Prisma ORM
- **Validation**: Zod
- **Testing**: Vitest
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown

## Domain Model

### Entities

```
User
├── email, name, avatar
├── creates Decisions
├── writes Comments
└── tracked in History

Decision
├── title, description, status, decidedAt
├── has many Options
├── has many Links (to projects, people, repos)
├── has many Tags
├── has many Comments
├── has change History
└── created by User

DecisionOption
├── title, pros, cons, chosen
└── belongs to Decision

Tag
├── name, slug, color, description
└── assigned to many Decisions

DecisionComment
├── content, createdAt
├── belongs to Decision
├── written by User
└── can have nested replies

DecisionHistory
├── action, fieldName, oldValue, newValue
├── tracks all changes to Decision
└── created by User

DecisionTemplate
├── name, description
├── title/description templates
└── reusable decision structures
```

### Relationships

```
User ──(creates)──> Decision
User ──(writes)──> Comment
Decision ──(has many)──> Option
Decision ──(has many)──> Link
Decision ──(tagged with)──> Tag
Decision ──(has many)──> Comment
Decision ──(tracked in)──> History
Comment ──(can have)──> Replies
```

## API Documentation

### Decisions

```bash
# List all decisions
GET /api/decisions?search=postgres&status=DECIDED&limit=20

# Get a decision
GET /api/decisions/:id

# Create a decision
POST /api/decisions
{
  "title": "Use PostgreSQL",
  "descriptionMarkdown": "## Context\n...",
  "status": "DECIDED",
  "options": [...],
  "links": [...]
}

# Update a decision
PUT /api/decisions/:id

# Delete a decision
DELETE /api/decisions/:id

# Get decision history
GET /api/decisions/:id/history
```

### Tags

```bash
# List all tags
GET /api/tags

# Create a tag
POST /api/tags
{
  "name": "Architecture",
  "description": "System design decisions",
  "color": "#3B82F6"
}

# Assign tag to decision
POST /api/tags/assign
{
  "decisionId": "...",
  "tagId": "..."
}

# Remove tag from decision
DELETE /api/tags/assign
```

### Comments

```bash
# Create a comment
POST /api/comments
{
  "decisionId": "...",
  "content": "Great decision!",
  "parentId": "..." // optional, for replies
}

# Update a comment
PUT /api/comments/:id

# Delete a comment
DELETE /api/comments/:id
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete API reference.

## Vertical Slices

### 1. Decision Lifecycle

Create → Add Options → Tag → Discuss → Decide → Track Changes

```typescript
// Create decision
const decision = await fetch('/api/decisions', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Use GraphQL',
    status: 'PROPOSED',
    options: [
      { title: 'GraphQL', pros: '...', cons: '...' },
      { title: 'REST', pros: '...', cons: '...' },
    ],
  }),
})

// Assign tags
await fetch('/api/tags/assign', {
  method: 'POST',
  body: JSON.stringify({
    decisionId: decision.id,
    tagId: architectureTag.id,
  }),
})

// Add comments
await fetch('/api/comments', {
  method: 'POST',
  body: JSON.stringify({
    decisionId: decision.id,
    content: 'I prefer GraphQL for its flexibility',
  }),
})

// Update status
await fetch(`/api/decisions/${decision.id}`, {
  method: 'PUT',
  body: JSON.stringify({ status: 'DECIDED' }),
})

// View history
const history = await fetch(`/api/decisions/${decision.id}/history`)
```

### 2. Tag-Based Organization

Create Tags → Assign to Decisions → Filter by Tags

### 3. Collaborative Decision Making

Comment → Reply → Discuss → Reach Consensus

### 4. Decision Archaeology

View History → Compare Versions → Understand Evolution

## Extension & Integration

The vault provides clean extension points for integration into larger systems.

### Event System

```typescript
import { eventEmitter } from '@/lib/events'

// Subscribe to domain events
eventEmitter.on('decision.created', async (event) => {
  await notifySlack(event.payload.decisionId)
  await indexInSearch(event.payload)
})

eventEmitter.on('tag.assigned', async (event) => {
  await updateKnowledgeGraph(event.payload)
})
```

### Adapters

```typescript
import { registerAdapter } from '@/lib/adapters'
import { SlackNotificationAdapter } from './my-slack-adapter'

// Swap default adapters
registerAdapter('notification', new SlackNotificationAdapter())
registerAdapter('search', new ElasticsearchAdapter())
registerAdapter('export', new PDFExportAdapter())
```

See [docs/INTEGRATION.md](docs/INTEGRATION.md) for comprehensive integration recipes.

## Development

### Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code
npm run typecheck        # Type check
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:ui          # Test UI

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:migrate       # Create migration
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database

# Docker
npm run docker:build     # Build image
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
npm run docker:logs      # View app logs
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Coverage
npm test -- --coverage
```

## Deployment

### Environment Variables

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"
NODE_ENV="production"
```

### Docker Production

```bash
# Build and deploy
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose exec app npm run db:migrate:deploy

# Seed production data
docker compose exec app npm run db:seed
```

### Vercel/Netlify

Compatible with serverless deployments. Configure:
- Database connection (use connection pooling)
- Environment variables
- Build command: `npm run build`
- Output directory: `.next`

## Connection to org-knowledge-graph-hub

This vault serves as a **specialized node** in a broader organizational knowledge graph:

### As a Data Source

Decisions become graph nodes with relationships:

```cypher
// Example Neo4j schema
(d:Decision)-[:RELATES_TO]->(p:Project)
(d:Decision)-[:DECIDED_BY]->(u:User)
(d:Decision)-[:HAS_TAG]->(t:Tag)
(d:Decision)-[:AFFECTS]->(r:Repository)
```

### As a Consumer

Query the knowledge graph to:
- Discover related decisions
- Surface relevant context
- Provide recommendations
- Track impact across the organization

### Integration Points

1. **Entity Links**: Connect decisions to graph entities
2. **Event Stream**: Feed events into graph update pipeline
3. **Query API**: Fetch related decisions from graph
4. **Bidirectional Sync**: Keep vault and graph in sync

See [docs/INTEGRATION.md#knowledge-graph-integration](docs/INTEGRATION.md#knowledge-graph-integration) for detailed recipes.

## Architecture

High-level architecture:

```
┌──────────────────────────────────────────────────┐
│              Client Layer                         │
│   (Next.js Pages, API Consumers)                 │
└─────────────┬────────────────────────────────────┘
              │
┌─────────────┴────────────────────────────────────┐
│           API + Validation Layer                  │
│   (Zod validation, error handling)               │
└─────────────┬────────────────────────────────────┘
              │
┌─────────────┴────────────────────────────────────┐
│           Service Layer                           │
│   (Business logic, events, logging)              │
└─────────────┬────────────────────────────────────┘
              │
┌─────────────┴────────────────────────────────────┐
│           Data Layer (Prisma + PostgreSQL)        │
└──────────────────────────────────────────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete documentation.

## Demo Data

After seeding, explore:

- **5 decisions** spanning different domains (architecture, security, devops)
- **6 tags** for organization (Architecture, Database, Security, etc.)
- **3 users** with different roles
- **Comments and discussions** on key decisions
- **Decision templates** for common patterns
- **Full audit history** of changes

Demo users:
- alice@example.com - Technical Lead
- bob@example.com - Engineering Manager
- carol@example.com - Product Manager

## Roadmap

### Phase 4: Advanced Features
- [ ] GraphQL API for flexible querying
- [ ] Real-time subscriptions (WebSocket)
- [ ] Advanced full-text search (Elasticsearch)
- [ ] Workflow engine (approval processes)
- [ ] Analytics dashboard
- [ ] Slack/Teams/JIRA integrations
- [ ] AI-powered insights and recommendations
- [ ] Decision templates marketplace
- [ ] Multi-tenancy support
- [ ] Advanced RBAC
- [ ] API rate limiting
- [ ] Webhook management UI

### Phase 5: Enterprise
- [ ] SSO/SAML integration
- [ ] Advanced security (field-level encryption)
- [ ] Compliance reporting (GDPR, SOC2)
- [ ] Advanced analytics (BI integration)
- [ ] Mobile apps (React Native)
- [ ] Offline support
- [ ] Multi-language support
- [ ] White-label customization

## Contributing

Contributions welcome! This repository is designed for:
- Bug fixes
- Feature additions
- Integration examples
- Documentation improvements
- Test coverage increases

## License

MIT

## Acknowledgments

Built as a production-ready building block for organizational knowledge management and decision archaeology in AI-driven ecosystems.

---

**Need help?** Check the [docs/](docs/) directory for:
- [Architecture](docs/ARCHITECTURE.md)
- [Integration Guide](docs/INTEGRATION.md)
- [Phase 3 Overview](docs/PHASE3_OVERVIEW.md)
