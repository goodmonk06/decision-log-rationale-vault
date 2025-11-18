# Integration Guide

This guide shows how to integrate the Decision Log Vault into larger ecosystems and workflows.

## Integration Patterns

### 1. Knowledge Graph Integration

The Decision Log Vault is designed to be a node in a larger organizational knowledge graph.

#### Exporting to Graph Database (Neo4j)

```typescript
import { prisma } from '@/lib/prisma'

async function exportToNeo4j() {
  const decisions = await prisma.decision.findMany({
    include: {
      options: true,
      links: true,
      tags: { include: { tag: true } },
      createdBy: true,
    },
  })

  for (const decision of decisions) {
    // Create Decision node
    await neo4j.run(`
      CREATE (d:Decision {
        id: $id,
        title: $title,
        status: $status,
        decidedAt: $decidedAt
      })
    `, decision)

    // Create relationships
    for (const link of decision.links) {
      await neo4j.run(`
        MATCH (d:Decision {id: $decisionId})
        MERGE (e:Entity {type: $entityType, id: $entityId})
        CREATE (d)-[:RELATES_TO]->(e)
      `, {
        decisionId: decision.id,
        entityType: link.entityType,
        entityId: link.entityIdOrRef,
      })
    }
  }
}
```

#### Querying Related Decisions

```cypher
// Find all decisions related to a project
MATCH (d:Decision)-[:RELATES_TO]->(p:Entity {type: 'PROJECT', id: 'auth-service'})
RETURN d

// Find decision makers for deprecated decisions
MATCH (d:Decision {status: 'DEPRECATED'})<-[:CREATED]-(u:User)
RETURN u, COUNT(d) as deprecatedCount
ORDER BY deprecatedCount DESC

// Find decisions influenced by specific people
MATCH (d:Decision)-[:RELATES_TO]->(p:Entity {type: 'PERSON', id: 'alice'})
RETURN d
```

### 2. Authentication Integration

#### NextAuth.js

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.userId = user.id
      return session
    },
  },
})
```

#### Middleware to track user

```typescript
// src/lib/middleware/auth.ts
import { getServerSession } from 'next-auth'

export async function getCurrentUser(request: NextRequest) {
  const session = await getServerSession()
  return session?.userId
}

// In API routes
const userId = await getCurrentUser(request)
await createDecision({ ...data, createdById: userId })
```

### 3. Notification Integration

#### Slack Notifications

```typescript
// src/lib/adapters/slack-notification.ts
import { INotificationAdapter, NotificationPayload } from './notification'

export class SlackNotificationAdapter implements INotificationAdapter {
  constructor(private webhookUrl: string) {}

  async send(payload: NotificationPayload): Promise<void> {
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: payload.title,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${payload.title}*\n${payload.message}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: 'View Decision' },
                url: `https://decisions.company.com/${payload.decisionId}`,
              },
            ],
          },
        ],
      }),
    })
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload)
    }
  }
}

// Register it
import { registerAdapter } from '@/lib/adapters'
registerAdapter('notification', new SlackNotificationAdapter(process.env.SLACK_WEBHOOK))
```

#### Email Notifications

```typescript
import { Resend } from 'resend'
import { INotificationAdapter } from './notification'

export class EmailNotificationAdapter implements INotificationAdapter {
  private resend = new Resend(process.env.RESEND_API_KEY)

  async send(payload: NotificationPayload): Promise<void> {
    await this.resend.emails.send({
      from: 'decisions@company.com',
      to: payload.metadata?.recipients || ['team@company.com'],
      subject: payload.title,
      html: `
        <h1>${payload.title}</h1>
        <p>${payload.message}</p>
        <a href="https://decisions.company.com/${payload.decisionId}">
          View Decision
        </a>
      `,
    })
  }
}
```

### 4. Search Integration

#### Elasticsearch

```typescript
// src/lib/adapters/elasticsearch.ts
import { Client } from '@elastic/elasticsearch'
import { ISearchAdapter, SearchQuery, SearchResult } from './search'

export class ElasticsearchAdapter implements ISearchAdapter {
  private client: Client

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL,
    })
  }

  async index(id: string, document: Record<string, any>): Promise<void> {
    await this.client.index({
      index: 'decisions',
      id,
      document: {
        title: document.title,
        description: document.descriptionMarkdown,
        status: document.status,
        tags: document.tags?.map(t => t.name),
        decidedAt: document.decidedAt,
      },
    })
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    const { body } = await this.client.search({
      index: 'decisions',
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query.query,
                  fields: ['title^3', 'description'],
                },
              },
            ],
            filter: [
              query.filters?.status && {
                terms: { status: query.filters.status },
              },
              query.filters?.tags && {
                terms: { tags: query.filters.tags },
              },
            ].filter(Boolean),
          },
        },
        size: query.limit || 20,
        from: query.offset || 0,
      },
    })

    return body.hits.hits.map(hit => ({
      id: hit._id,
      title: hit._source.title,
      snippet: hit._source.description?.substring(0, 200),
      score: hit._score,
    }))
  }

  async delete(id: string): Promise<void> {
    await this.client.delete({
      index: 'decisions',
      id,
    })
  }

  async reindex(): Promise<void> {
    const decisions = await prisma.decision.findMany({
      include: { tags: { include: { tag: true } } },
    })

    for (const decision of decisions) {
      await this.index(decision.id, decision)
    }
  }
}
```

### 5. Workflow Integration

#### Event-Based Workflows

```typescript
// Subscribe to decision events for workflows
import { eventEmitter } from '@/lib/events'
import { createComment } from '@/lib/services/comments'

// Auto-comment on new decisions
eventEmitter.on('decision.created', async (event) => {
  await createComment({
    decisionId: event.payload.decisionId,
    content: `Decision created by ${event.userId}. Please review and provide feedback.`,
  })
})

// Notify when decision status changes
eventEmitter.on('decision.status_changed', async (event) => {
  if (event.payload.newStatus === 'DECIDED') {
    await notificationAdapter.send({
      title: 'Decision Finalized',
      message: `Decision "${event.payload.decisionId}" has been marked as DECIDED`,
      decisionId: event.payload.decisionId,
    })
  }
})

// Track decision velocity
eventEmitter.on('decision.created', async (event) => {
  metrics.counter('decisions.by_status', 1, {
    status: event.payload.status,
  })
})
```

### 6. External System Integration

#### JIRA Integration

```typescript
// Link decisions to JIRA tickets
import { JiraClient } from 'jira-client'

const jira = new JiraClient({
  host: 'company.atlassian.net',
  authentication: {
    basic: {
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_API_TOKEN,
    },
  },
})

// Create JIRA ticket from decision
async function createJiraTicketForDecision(decisionId: string) {
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: { options: true },
  })

  const issue = await jira.createIssue({
    fields: {
      project: { key: 'ARCH' },
      summary: decision.title,
      description: decision.descriptionMarkdown,
      issuetype: { name: 'Decision' },
    },
  })

  // Link back
  await prisma.decisionLink.create({
    data: {
      decisionId,
      entityType: 'OTHER',
      entityIdOrRef: `JIRA:${issue.key}`,
      metaJson: { jiraUrl: issue.self },
    },
  })

  return issue
}
```

### 7. Analytics Integration

#### Export to Data Warehouse

```typescript
async function exportToDataWarehouse() {
  const decisions = await prisma.decision.findMany({
    include: {
      options: true,
      tags: { include: { tag: true } },
      createdBy: true,
    },
  })

  // Transform to analytics schema
  const analyticsData = decisions.map(d => ({
    decision_id: d.id,
    title: d.title,
    status: d.status,
    decided_at: d.decidedAt,
    created_by_id: d.createdById,
    created_by_email: d.createdBy?.email,
    num_options: d.options.length,
    num_tags: d.tags.length,
    time_to_decision: d.status === 'DECIDED'
      ? (new Date(d.decidedAt).getTime() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      : null,
  }))

  // Send to data warehouse (BigQuery, Snowflake, etc.)
  await bigquery.dataset('decisions').table('fact_decisions').insert(analyticsData)
}
```

## API Client Libraries

### TypeScript/JavaScript

```typescript
import { DecisionVaultClient } from '@company/decision-vault-client'

const client = new DecisionVaultClient({
  baseUrl: 'https://decisions.company.com/api',
  apiKey: process.env.DECISION_VAULT_API_KEY,
})

// Create a decision
const decision = await client.decisions.create({
  title: 'Use GraphQL',
  status: 'PROPOSED',
  options: [
    {
      title: 'GraphQL',
      pros: '- Flexible queries\n- Type-safe',
      chosen: false,
    },
  ],
})

// Search decisions
const results = await client.decisions.search({
  query: 'graphql',
  filters: { status: ['PROPOSED', 'DECIDED'] },
})

// Subscribe to events
client.events.on('decision.created', (event) => {
  console.log('New decision:', event.payload)
})
```

### Python

```python
from decision_vault import DecisionVaultClient

client = DecisionVaultClient(
    base_url="https://decisions.company.com/api",
    api_key=os.getenv("DECISION_VAULT_API_KEY")
)

# Create decision
decision = client.decisions.create(
    title="Use PostgreSQL",
    status="DECIDED",
    tags=["database", "architecture"]
)

# Query decisions
decisions = client.decisions.list(
    status="DECIDED",
    tags=["architecture"]
)
```

## Webhooks

### Setting up webhooks

```typescript
// POST /api/webhooks/register
{
  "url": "https://your-service.com/webhook",
  "events": ["decision.created", "decision.status_changed"],
  "secret": "your-webhook-secret"
}

// When event occurs, POST to webhook URL:
{
  "id": "evt_123",
  "type": "decision.created",
  "timestamp": "2025-03-20T10:00:00Z",
  "payload": {
    "decisionId": "dec_456",
    "title": "Use PostgreSQL",
    "status": "DECIDED"
  },
  "signature": "sha256=..."  // HMAC signature for verification
}
```

## Best Practices

1. **Use events for async operations**: Don't block API responses
2. **Implement retries**: External systems can be unreliable
3. **Log all integrations**: Debug issues easily
4. **Version your integrations**: Support multiple API versions
5. **Test integrations**: Use stubs/mocks in development
6. **Monitor integration health**: Track success/failure rates
7. **Document your integrations**: Help future maintainers

## Example: Complete Integration

```typescript
// Complete setup with all integrations
import { registerAdapter } from '@/lib/adapters'
import { eventEmitter } from '@/lib/events'
import { SlackNotificationAdapter } from './integrations/slack'
import { ElasticsearchAdapter } from './integrations/elasticsearch'
import { JiraWorkflowHandler } from './integrations/jira'

// Register adapters
registerAdapter('notification', new SlackNotificationAdapter(process.env.SLACK_WEBHOOK))
registerAdapter('search', new ElasticsearchAdapter())

// Set up event handlers
JiraWorkflowHandler.register(eventEmitter)

// Now all new decisions will:
// 1. Send Slack notification
// 2. Index in Elasticsearch
// 3. Create JIRA tickets for DECIDED status
```
