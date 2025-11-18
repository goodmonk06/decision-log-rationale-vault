import "dotenv/config"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.decisionLink.deleteMany()
  await prisma.decisionOption.deleteMany()
  await prisma.decision.deleteMany()

  // Decision 1: Use PostgreSQL
  const postgresDecision = await prisma.decision.create({
    data: {
      title: 'Use PostgreSQL as Primary Database',
      descriptionMarkdown: `## Context

Our application requires a robust, scalable database solution that can handle complex queries and maintain data integrity.

## Requirements

- ACID compliance
- Support for complex queries
- Good performance at scale
- Strong community support
- JSON support for flexible schema needs`,
      status: 'DECIDED',
      decidedAt: new Date('2025-01-15T10:00:00Z'),
      metaJson: {
        impactLevel: 'high',
        stakeholders: ['backend-team', 'devops-team'],
      },
      options: {
        create: [
          {
            title: 'PostgreSQL',
            chosen: true,
            prosMarkdown: `- Battle-tested and widely used
- Excellent ACID compliance
- Advanced features (JSON, full-text search, etc.)
- Strong community and ecosystem
- Great performance for complex queries
- Free and open source`,
            consMarkdown: `- Slightly more complex setup than some alternatives
- Requires more careful tuning for optimal performance
- Steeper learning curve for advanced features`,
          },
          {
            title: 'MySQL',
            chosen: false,
            prosMarkdown: `- Very popular and widely supported
- Simpler to get started
- Good performance for simple queries
- Large ecosystem`,
            consMarkdown: `- Less advanced features compared to PostgreSQL
- Weaker handling of complex queries
- Some ACID compliance issues in older versions`,
          },
          {
            title: 'MongoDB',
            chosen: false,
            prosMarkdown: `- Flexible schema
- Good horizontal scaling
- Fast for simple document operations
- Popular for rapid prototyping`,
            consMarkdown: `- Lack of ACID transactions (in older versions)
- Less suitable for complex relational data
- Potential for data inconsistency
- Our data is inherently relational`,
          },
        ],
      },
      links: {
        create: [
          {
            entityType: 'PROJECT',
            entityIdOrRef: 'decision-log-vault',
          },
          {
            entityType: 'PERSON',
            entityIdOrRef: 'tech-lead',
          },
          {
            entityType: 'REPO',
            entityIdOrRef: 'github.com/org/backend-api',
          },
        ],
      },
    },
  })

  console.log(`Created decision: ${postgresDecision.title}`)

  // Decision 2: Split Monorepo
  const monorepoDecision = await prisma.decision.create({
    data: {
      title: 'Split Monorepo into Separate Service Repositories',
      descriptionMarkdown: `## Context

Our current monorepo has grown to include 15+ services, leading to long CI/CD times and deployment complexity.

## Problem Statement

- CI/CD pipeline takes 45+ minutes for a single service change
- Developers must understand entire codebase structure
- Deployment of one service requires full monorepo build
- Merge conflicts are frequent with many teams

## Goals

- Reduce deployment time
- Improve team autonomy
- Simplify CI/CD pipeline
- Enable independent service versioning`,
      status: 'DECIDED',
      decidedAt: new Date('2025-02-01T14:30:00Z'),
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
            prosMarkdown: `- Independent CI/CD per service (5-10 min vs 45+ min)
- Teams own their entire repository
- Clearer service boundaries
- Easier to onboard new developers to specific services
- Independent versioning and release cycles
- Smaller git history per repo`,
            consMarkdown: `- Initial migration effort is significant
- Shared code requires separate packages
- More repositories to manage
- Cross-service changes require multiple PRs
- Potential for code duplication`,
          },
          {
            title: 'Keep Monorepo with Build Optimization',
            chosen: false,
            prosMarkdown: `- No migration needed
- Easier code sharing
- Atomic cross-service changes
- Single source of truth
- Simplified dependency management`,
            consMarkdown: `- Still requires entire repo checkout
- Optimization has limits
- Continues to get worse as we add services
- Doesn't solve team autonomy issues
- Complex tooling needed for selective builds`,
          },
          {
            title: 'Hybrid: Core Monorepo + Satellite Services',
            chosen: false,
            prosMarkdown: `- Gradual migration path
- Keep related services together
- Some benefits of both approaches`,
            consMarkdown: `- Complex to maintain two patterns
- Unclear which services go where
- Doesn't fully solve the problems
- May confuse developers`,
          },
        ],
      },
      links: {
        create: [
          {
            entityType: 'PROJECT',
            entityIdOrRef: 'microservices-migration',
          },
          {
            entityType: 'PERSON',
            entityIdOrRef: 'engineering-director',
          },
          {
            entityType: 'PERSON',
            entityIdOrRef: 'platform-lead',
          },
          {
            entityType: 'OTHER',
            entityIdOrRef: 'architecture-doc-2025-Q1',
          },
        ],
      },
    },
  })

  console.log(`Created decision: ${monorepoDecision.title}`)

  // Decision 3: API Versioning Strategy (Proposed)
  const apiVersioningDecision = await prisma.decision.create({
    data: {
      title: 'API Versioning Strategy',
      descriptionMarkdown: `## Context

As we expose our APIs to external partners, we need a clear versioning strategy to manage breaking changes.

## Requirements

- Support multiple API versions simultaneously
- Clear deprecation path
- Minimal overhead for API consumers
- Easy to implement and maintain`,
      status: 'PROPOSED',
      decidedAt: new Date('2025-03-10T09:00:00Z'),
      metaJson: {
        impactLevel: 'medium',
        deadline: '2025-03-31',
      },
      options: {
        create: [
          {
            title: 'URL Path Versioning (e.g., /v1/, /v2/)',
            chosen: false,
            prosMarkdown: `- Clear and explicit version in URL
- Easy to route different versions
- Industry standard approach
- Simple to test different versions
- Cache-friendly`,
            consMarkdown: `- URL changes with every version
- Can lead to code duplication
- Requires routing configuration`,
          },
          {
            title: 'Header-based Versioning',
            chosen: false,
            prosMarkdown: `- URL remains constant
- More RESTful approach
- Flexible version negotiation`,
            consMarkdown: `- Less visible to developers
- Harder to test in browser
- More complex routing logic
- Caching can be problematic`,
          },
          {
            title: 'Query Parameter Versioning',
            chosen: false,
            prosMarkdown: `- Simple to implement
- Easy to test
- URL-based like path versioning`,
            consMarkdown: `- Not standard practice
- Pollutes query parameters
- Less clean than path versioning`,
          },
        ],
      },
      links: {
        create: [
          {
            entityType: 'PROJECT',
            entityIdOrRef: 'public-api',
          },
          {
            entityType: 'PERSON',
            entityIdOrRef: 'api-team-lead',
          },
        ],
      },
    },
  })

  console.log(`Created decision: ${apiVersioningDecision.title}`)

  console.log('\nSeeding completed successfully!')
  console.log(`\nCreated ${await prisma.decision.count()} decisions`)
  console.log(`Created ${await prisma.decisionOption.count()} options`)
  console.log(`Created ${await prisma.decisionLink.count()} links`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
