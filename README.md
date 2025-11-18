# Decision Log Rationale Vault

A comprehensive decision tracking system built with Next.js, TypeScript, Prisma, and PostgreSQL. This application helps teams record, track, and explore important technical and organizational decisions along with their context, options considered, and rationale.

## Features

### 1. Decision Management
- **Create & Track Decisions**: Record important decisions with full context
- **Status Tracking**: Mark decisions as Proposed, Decided, or Deprecated
- **Rich Markdown Support**: Use markdown for detailed descriptions and rationale
- **Timestamps**: Automatic tracking of creation and decision dates

### 2. Options & Rationale
- **Multiple Options**: Document all options considered for each decision
- **Pros & Cons**: Record advantages and disadvantages for each option
- **Chosen Indicator**: Mark which option(s) were ultimately chosen
- **Comparison View**: Easy visual comparison of different options

### 3. Entity Linking
- **Link to Related Entities**: Connect decisions to:
  - Projects
  - People
  - Repositories
  - Other entities
- **Contextual Metadata**: Attach additional metadata to each link

### 4. Timeline & Discovery
- **Timeline View**: Chronological visualization of all decisions
- **Full-Text Search**: Search across decision titles and descriptions
- **Filtering**: Filter decisions by status and other criteria
- **Detail Pages**: Rich detail view for each decision

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Markdown**: react-markdown

## Getting Started

### Prerequisites

- Node.js 20+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd decision-log-rationale-vault
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database connection:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Seed the database with example data:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Decision
- `id`: Unique identifier
- `title`: Decision title
- `descriptionMarkdown`: Full context and description (markdown)
- `decidedAt`: When the decision was made
- `status`: PROPOSED | DECIDED | DEPRECATED
- `metaJson`: Additional metadata (JSON)

### DecisionOption
- `id`: Unique identifier
- `decisionId`: Reference to parent decision
- `title`: Option title
- `prosMarkdown`: Advantages (markdown)
- `consMarkdown`: Disadvantages (markdown)
- `chosen`: Whether this option was selected

### DecisionLink
- `id`: Unique identifier
- `decisionId`: Reference to parent decision
- `entityType`: PROJECT | PERSON | REPO | OTHER
- `entityIdOrRef`: Entity identifier or reference
- `metaJson`: Additional link metadata (JSON)

## API Routes

### Decisions
- `GET /api/decisions` - List all decisions (supports search & filtering)
- `POST /api/decisions` - Create a new decision
- `GET /api/decisions/[id]` - Get a specific decision
- `PUT /api/decisions/[id]` - Update a decision
- `DELETE /api/decisions/[id]` - Delete a decision

### Options
- `POST /api/options` - Create a new option
- `PUT /api/options/[id]` - Update an option
- `DELETE /api/options/[id]` - Delete an option

### Links
- `POST /api/links` - Create a new link
- `PUT /api/links/[id]` - Update a link
- `DELETE /api/links/[id]` - Delete a link

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:seed` - Seed database with example data
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
decision-log-rationale-vault/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── decisions/         # Decision pages
│   │   ├── search/            # Search page
│   │   └── page.tsx           # Home/timeline page
│   ├── components/            # React components
│   ├── lib/                   # Utilities (Prisma client)
│   └── types/                 # TypeScript types
└── package.json
```

## Connection to org-knowledge-graph-hub

This Decision Log Vault serves as a specialized node in a broader **organizational knowledge graph ecosystem**. It can integrate with an `org-knowledge-graph-hub` in several ways:

### 1. Entity Linking
The DecisionLink model allows decisions to reference entities managed by other systems:
- **Projects** from project management tools
- **People** from HR/directory systems
- **Repositories** from code hosting platforms
- **Other** decisions, documents, or artifacts

### 2. Knowledge Graph Integration Patterns

#### As a Data Source
The vault can export its data to feed into a central knowledge graph:
```typescript
// Example: Decision nodes become graph nodes
{
  type: 'Decision',
  id: decision.id,
  title: decision.title,
  status: decision.status,
  links: [
    { type: 'RELATES_TO', targetType: 'Project', targetId: 'proj-123' },
    { type: 'DECIDED_BY', targetType: 'Person', targetId: 'person-456' },
    { type: 'AFFECTS', targetType: 'Repository', targetId: 'repo-789' }
  ]
}
```

#### As a Consumer
The vault can query the knowledge graph to:
- Discover related decisions based on entity relationships
- Surface relevant context from connected systems
- Provide recommendations for decision makers
- Track decision impact across the organization

### 3. Integration Points

#### API-First Design
All decision data is accessible via REST APIs, making it easy to:
- Sync with a central graph database (Neo4j, TigerGraph, etc.)
- Build ETL pipelines to populate the knowledge graph
- Create webhooks for real-time updates

#### Entity Type Extensibility
The `EntityType` enum and `metaJson` fields allow flexible linking:
```prisma
enum EntityType {
  PROJECT
  PERSON
  REPO
  OTHER
}
```

Add custom metadata to links:
```json
{
  "sourceSystem": "jira",
  "externalId": "PROJ-123",
  "lastSync": "2025-03-15T10:00:00Z"
}
```

### 4. Future Enhancements for Graph Integration

- **GraphQL API**: Add a GraphQL layer for more flexible querying
- **Webhook Support**: Emit events when decisions change for real-time sync
- **Bidirectional Sync**: Allow the knowledge graph to push related context back
- **Visualization**: Build interactive graph visualizations showing decision relationships
- **Impact Analysis**: Trace decision impact through the knowledge graph

### 5. Example Knowledge Graph Queries

Once integrated, you could run queries like:

**"Find all decisions related to the Auth Service project"**
```cypher
MATCH (d:Decision)-[:RELATES_TO]->(p:Project {name: 'Auth Service'})
RETURN d
```

**"Show decision history for decisions made by the Platform Team"**
```cypher
MATCH (d:Decision)-[:DECIDED_BY]->(person:Person)-[:MEMBER_OF]->(team:Team {name: 'Platform Team'})
RETURN d ORDER BY d.decidedAt DESC
```

**"Find deprecated decisions that affect active repositories"**
```cypher
MATCH (d:Decision {status: 'DEPRECATED'})-[:AFFECTS]->(r:Repository {status: 'active'})
RETURN d, r
```

## Design Principles

### Explorable Past Decisions
The primary goal is to make past decisions **discoverable and understandable**:

1. **Context is King**: Every decision includes rich markdown context
2. **Options Matter**: Document what was *not* chosen and why
3. **Links Provide Context**: Connect decisions to the broader org ecosystem
4. **Timeline View**: Understand decision evolution over time
5. **Search First**: Full-text search makes decisions findable

### Clarity of Structure
- Clean domain model (Decision, Option, Link)
- Type-safe TypeScript throughout
- RESTful API design
- Server-side rendering for performance
- Responsive, accessible UI

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Submit a pull request

## License

MIT

## Acknowledgments

Built as a foundational component for organizational knowledge management and decision archaeology.
