import "dotenv/config"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with comprehensive data...')

  // Clear existing data
  await prisma.decisionHistory.deleteMany()
  await prisma.decisionComment.deleteMany()
  await prisma.decisionTagAssignment.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.decisionLink.deleteMany()
  await prisma.decisionOption.deleteMany()
  await prisma.decision.deleteMany()
  await prisma.user.deleteMany()
  await prisma.decisionTemplate.deleteMany()

  console.log('✓ Cleared existing data')

  // Create users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
    },
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
  })

  const carol = await prisma.user.create({
    data: {
      email: 'carol@example.com',
      name: 'Carol Williams',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
    },
  })

  console.log('✓ Created 3 users')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: 'Architecture',
        slug: 'architecture',
        description: 'System architecture and design decisions',
        color: '#3B82F6',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Database',
        slug: 'database',
        description: 'Database technology and schema decisions',
        color: '#10B981',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Security',
        slug: 'security',
        description: 'Security-related decisions',
        color: '#EF4444',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'Performance',
        slug: 'performance',
        description: 'Performance optimization decisions',
        color: '#F59E0B',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'DevOps',
        slug: 'devops',
        description: 'Infrastructure and deployment decisions',
        color: '#8B5CF6',
      },
    }),
    prisma.tag.create({
      data: {
        name: 'API Design',
        slug: 'api-design',
        description: 'API architecture and design patterns',
        color: '#EC4899',
      },
    }),
  ])

  console.log('✓ Created 6 tags')

  // Decision 1: PostgreSQL
  const decision1 = await prisma.decision.create({
    data: {
      title: 'Use PostgreSQL as Primary Database',
      descriptionMarkdown: `## Context
We need a robust database solution that can handle complex queries, maintain data integrity, and scale with our growing user base.
## Requirements
- ACID compliance for financial transactions
- JSON support for flexible metadata
- Full-text search capabilities
- Strong community and ecosystem
- Excellent performance at scale`,
      status: 'DECIDED',
      decidedAt: new Date('2025-01-15T10:00:00Z'),
      createdById: alice.id,
      metaJson: {
        impactLevel: 'critical',
        stakeholders: ['backend-team', 'devops-team', 'data-team'],
      },
      options: {
        create: [
          {
            title: 'PostgreSQL',
            chosen: true,
            prosMarkdown: `- Battle-tested reliability
- Excellent ACID compliance
- Advanced features (JSONB, full-text search, arrays)
- Strong ecosystem and tooling
- Great performance for complex queries
- Open source with permissive license`,
            consMarkdown: `- Requires careful tuning for optimal performance
- Steeper learning curve for advanced features
- Vertical scaling limitations (though excellent for most use cases)`,
          },
          {
            title: 'MySQL',
            chosen: false,
            prosMarkdown: `- Very popular and widely used
- Simple to set up and maintain
- Good for read-heavy workloads
- Large community`,
            consMarkdown: `- Fewer advanced features
- Weaker handling of complex queries
- Historical ACID compliance issues
- Less suitable for our analytical workloads`,
          },
          {
            title: 'MongoDB',
            chosen: false,
            prosMarkdown: `- Schema flexibility
- Horizontal scaling support
- Fast for simple document operations
- Popular for prototyping`,
            consMarkdown: `- Lack of ACID in older versions
- Not ideal for relational data (our primary use case)
- Potential data inconsistency risks
- Overkill for structured data`,
          },
        ],
      },
      links: {
        create: [
          {
            entityType: 'PROJECT',
            entityIdOrRef: 'decision-vault',
          },
          {
            entityType: 'PERSON',
            entityIdOrRef: 'alice-johnson',
          },
          {
            entityType: 'REPO',
            entityIdOrRef: 'github.com/org/backend-api',
          },
        ],
      },
      tags: {
        create: [
          { tagId: tags[1].id }, // Database
          { tagId: tags[0].id }, // Architecture
        ],
      },
    },
  })

  // Add comments to decision 1
  const comment1 = await prisma.decisionComment.create({
    data: {
      decisionId: decision1.id,
      userId: bob.id,
      content: 'Great choice! PostgreSQL is rock solid and the JSONB support will be invaluable for our flexible metadata needs.',
    },
  })

  await prisma.decisionComment.create({
    data: {
      decisionId: decision1.id,
      userId: carol.id,
      content: 'Agreed. I also appreciate the strong full-text search capabilities which will help us avoid adding Elasticsearch initially.',
      parentId: comment1.id,
    },
  })

  // Add history to decision 1
  await prisma.decisionHistory.create({
    data: {
      decisionId: decision1.id,
      userId: alice.id,
      action: 'CREATED',
      metaJson: { source: 'architecture-meeting' },
    },
  })

  console.log('✓ Created decision: Use PostgreSQL')

  // Decision 2: Monorepo split
  const decision2 = await prisma.decision.create({
    data: {
      title: 'Split Monorepo into Service Repositories',
      descriptionMarkdown: `## Problem
Our monorepo has grown to 15+ services, causing:
- 45+ minute CI/CD times for single service changes
- Merge conflicts across teams
- Complex deployment coordination
- Cognitive overhead for new developers
## Goals
- Reduce deployment time to <10 minutes
- Enable independent service versioning
- Improve team autonomy
- Simplify onboarding`,
      status: 'DECIDED',
      decidedAt: new Date('2025-02-01T14:30:00Z'),
      createdById: bob.id,
      metaJson: {
        impactLevel: 'critical',
        estimatedEffort: '3 months',
        teams: ['platform', 'infrastructure', 'all-product-teams'],
      },
      options: {
        create: [
          {
            title: 'Split into Service Repositories',
            chosen: true,
            prosMarkdown: `- Independent CI/CD (5-10 min vs 45+ min)
- Clear ownership boundaries
- Teams control their entire stack
- Independent versioning and releases
- Easier onboarding to specific services
- Smaller git history per repo`,
            consMarkdown: `- Significant migration effort
- Shared code requires separate packages
- More repositories to manage
- Cross-service changes need multiple PRs
- Risk of code duplication`,
          },
          {
            title: 'Optimize Monorepo with Build Tools',
            chosen: false,
            prosMarkdown: `- No migration needed
- Simpler code sharing
- Atomic cross-service changes
- Single source of truth`,
            consMarkdown: `- Still requires full checkout
- Optimization has diminishing returns
- Problem will worsen as we grow
- Doesn't solve team autonomy issues`,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // Architecture
          { tagId: tags[4].id }, // DevOps
        ],
      },
    },
  })

  await prisma.decisionComment.create({
    data: {
      decisionId: decision2.id,
      userId: alice.id,
      content: 'This was a tough call, but the team autonomy benefits are worth the migration pain.',
    },
  })

  console.log('✓ Created decision: Split Monorepo')

  // Decision 3: API Versioning
  const decision3 = await prisma.decision.create({
    data: {
      title: 'Use URL Path Versioning for Public API',
      descriptionMarkdown: `## Context
As we expose APIs to external partners, we need a clear versioning strategy to manage breaking changes gracefully.
## Constraints
- Must support multiple versions simultaneously
- Clear deprecation path
- Minimal friction for API consumers`,
      status: 'DECIDED',
      decidedAt: new Date('2025-03-10T09:00:00Z'),
      createdById: carol.id,
      options: {
        create: [
          {
            title: 'URL Path Versioning (/v1/, /v2/)',
            chosen: true,
            prosMarkdown: `- Explicit and visible
- Easy to route
- Industry standard
- Simple to test
- Cache-friendly`,
            consMarkdown: `- URL changes per version
- Can lead to duplication
- Routing configuration needed`,
          },
          {
            title: 'Header-based Versioning',
            chosen: false,
            prosMarkdown: `- Clean URLs
- More RESTful
- Flexible negotiation`,
            consMarkdown: `- Less discoverable
- Harder to test
- Complex routing
- Caching issues`,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tags[5].id }, // API Design
          { tagId: tags[0].id }, // Architecture
        ],
      },
    },
  })

  console.log('✓ Created decision: API Versioning')

  // Decision 4: Authentication
  const decision4 = await prisma.decision.create({
    data: {
      title: 'Implement OAuth 2.0 with JWT for Authentication',
      descriptionMarkdown: `## Requirements
- Secure authentication for web and mobile
- Support for third-party integrations
- Stateless token validation
- Role-based access control`,
      status: 'DECIDED',
      decidedAt: new Date('2025-03-15T11:00:00Z'),
      createdById: alice.id,
      options: {
        create: [
          {
            title: 'OAuth 2.0 + JWT',
            chosen: true,
            prosMarkdown: `- Industry standard
- Stateless validation
- Works well with microservices
- Third-party integration support
- Mobile-friendly`,
            consMarkdown: `- Token revocation complexity
- Need proper key rotation
- Careful expiration management`,
          },
          {
            title: 'Session-based Auth',
            chosen: false,
            prosMarkdown: `- Simpler implementation
- Easy revocation
- Traditional pattern`,
            consMarkdown: `- Requires shared session store
- Doesn't scale horizontally well
- Not ideal for mobile`,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tags[2].id }, // Security
          { tagId: tags[0].id }, // Architecture
        ],
      },
    },
  })

  console.log('✓ Created decision: OAuth + JWT')

  // Decision 5: Caching Strategy (Proposed)
  const decision5 = await prisma.decision.create({
    data: {
      title: 'Implement Redis for Application Caching',
      descriptionMarkdown: `## Context
We're experiencing increased database load during peak hours. Need a caching layer to improve response times and reduce DB pressure.
## Metrics
- Current P95 response time: 850ms
- Target P95: <200ms
- Database CPU usage peaks at 85%`,
      status: 'PROPOSED',
      decidedAt: new Date('2025-03-20T10:00:00Z'),
      createdById: bob.id,
      options: {
        create: [
          {
            title: 'Redis',
            chosen: false,
            prosMarkdown: `- Extremely fast (sub-millisecond)
- Rich data structures
- Pub/sub support
- Large ecosystem
- Battle-tested`,
            consMarkdown: `- Additional infrastructure
- In-memory = data loss risk
- Need persistence strategy
- Operational complexity`,
          },
          {
            title: 'Memcached',
            chosen: false,
            prosMarkdown: `- Simple and fast
- Lower memory footprint
- Easy to operate`,
            consMarkdown: `- Limited data structures
- No persistence
- Fewer features than Redis`,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tags[3].id }, // Performance
          { tagId: tags[1].id }, // Database
        ],
      },
    },
  })

  console.log('✓ Created decision: Redis Caching (Proposed)')

  // Create templates
  await prisma.decisionTemplate.create({
    data: {
      name: 'Technology Selection',
      description: 'Template for evaluating and selecting technologies',
      titleTemplate: 'Use [Technology] for [Purpose]',
      descriptionTemplate: `## Context
[Describe the problem and why a decision is needed]
## Requirements
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]
## Constraints
- [Constraint 1]
- [Constraint 2]`,
      optionsTemplate: {
        example: {
          title: 'Technology Name',
          pros: ['Pro 1', 'Pro 2'],
          cons: ['Con 1', 'Con 2'],
        },
      },
      tagsTemplate: ['architecture', 'technology'],
    },
  })

  await prisma.decisionTemplate.create({
    data: {
      name: 'Process Change',
      description: 'Template for process and workflow decisions',
      titleTemplate: 'Change [Process] to [New Approach]',
      descriptionTemplate: `## Current State
[Describe how things work now]
## Problems
- [Problem 1]
- [Problem 2]
## Proposed Solution
[Describe the new approach]
## Expected Outcomes
- [Outcome 1]
- [Outcome 2]`,
    },
  })

  console.log('✓ Created 2 decision templates')

  // Print summary
  const decisionCount = await prisma.decision.count()
  const optionCount = await prisma.decisionOption.count()
  const commentCount = await prisma.decisionComment.count()
  const tagCount = await prisma.tag.count()
  const userCount = await prisma.user.count()

  console.log('\n✅ Seeding completed successfully!')
  console.log(`
Summary:
  - ${userCount} users
  - ${decisionCount} decisions
  - ${optionCount} options
  - ${commentCount} comments
  - ${tagCount} tags
  - 2 templates
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
