# Phase 3 Overview: Decision Log Rationale Vault

## Purpose

The Decision Log Rationale Vault is a production-grade system for capturing, tracking, and exploring organizational decisions. It serves as the **institutional memory** for technical and business decisions, making past reasoning accessible and searchable. This enables teams to:

- **Avoid repeating past mistakes** by understanding why certain paths were not chosen
- **Onboard new team members** quickly with context on how the organization arrived at its current state
- **Track decision evolution** over time as circumstances change
- **Connect decisions to their impact** across projects, people, and repositories
- **Build organizational knowledge graphs** by linking decisions to other entities in the ecosystem

This repository is designed as a reusable building block in a larger "AI-driven community / civilization OS" ecosystem, providing decision archaeology capabilities to any service that needs to track reasoning and context.

## Current Features

- ✅ **Core decision tracking** with title, description (markdown), status, and timestamps
- ✅ **Options framework** to document alternatives considered with pros/cons
- ✅ **Entity linking** to connect decisions to projects, people, repos, and other entities
- ✅ **Timeline views** showing decisions chronologically
- ✅ **Full-text search** across decision titles and descriptions
- ✅ **REST API** with validation (Zod) and error handling
- ✅ **Type-safe** end-to-end with TypeScript
- ✅ **Docker support** for easy deployment
- ✅ **Seed data** with realistic example decisions
- ✅ **Test coverage** for validation and error handling

## Current Limitations

- ❌ **No tagging system** - difficult to organize/filter decisions by topic
- ❌ **No comment/discussion** - can't track ongoing conversation about decisions
- ❌ **No audit history** - can't see how decisions evolved over time
- ❌ **No user attribution** - don't know who made/influenced decisions
- ❌ **Limited extension points** - hard to plug in notifications, metrics, external systems
- ❌ **No event system** - can't react to decision changes
- ❌ **Minimal logging** - difficult to debug or monitor
- ❌ **Single vertical slice** - only basic CRUD, need richer workflows
- ❌ **Limited test coverage** - need integration and scenario tests

## Phase 3 Plan

### 1. Domain Deepening (New Entities)

**DecisionTag**
- Many-to-many relationship with decisions
- Enable topical organization (e.g., "architecture", "security", "cost-optimization")
- Support filtering and discovery by tag

**DecisionComment**
- Threaded discussions on decisions
- Track stakeholder input and debate
- Timestamps and attribution

**DecisionHistory**
- Audit log of all changes to a decision
- Track who changed what and when
- Enable decision archaeology - understand how thinking evolved

**User**
- Track who created decisions
- Attribution for comments and changes
- Enable filtering by decision-maker

**DecisionTemplate**
- Reusable decision structures
- Standardize decision documentation
- Include common option frameworks

### 2. Multiple Vertical Slices

Beyond basic CRUD, implement complete workflows:

**Slice 1: Decision Lifecycle Management**
- Create decision from template → Add options → Gather feedback (comments) → Mark decision → Track implementation

**Slice 2: Tag-Based Organization**
- Create tags → Assign to decisions → Filter/search by tags → Tag analytics

**Slice 3: Collaboration & Discussion**
- Add comments → Tag participants → Resolve discussions → Link to implementation

**Slice 4: Decision Archaeology**
- View decision history → Compare versions → Understand evolution → Export timeline

### 3. Extensibility & Integration Points

**Adapter Interfaces**
- `INotificationAdapter` - Send notifications when decisions change
- `ISearchAdapter` - Pluggable search backends (PostgreSQL FTS, Elasticsearch, etc.)
- `IMetricsAdapter` - Track decision metrics (time-to-decision, stakeholder count, etc.)
- `IExportAdapter` - Export decisions to various formats (PDF, Markdown, etc.)

**Event System**
- `DecisionCreated`, `DecisionUpdated`, `DecisionDeprecated`
- `OptionChosen`, `CommentAdded`, `TagAssigned`
- Enable reactive workflows and integrations

**Plugin Registry**
- In-memory registry for development
- Easily swappable for production implementations

### 4. DX Enhancements

- ✅ Comprehensive scripts (dev, build, test, lint, typecheck, docker, db)
- ➕ CLI tool for maintenance operations (migrate tags, export decisions, etc.)
- ➕ Fixtures and test data factories
- ➕ Integration test helpers

### 5. Observability

- **Logging**: Structured logging with context (request ID, user, decision ID)
- **Metrics**: Decision creation rate, time-to-decision, active discussions
- **Tracing**: API performance and bottleneck identification

### 6. Quality & Testing

- ➕ Integration tests for vertical slices
- ➕ Scenario tests (complete user journeys)
- ➕ Test fixtures for complex scenarios
- ➕ Performance tests for search and timeline

### 7. Seed Data & Fixtures

- ➕ 20+ realistic decisions spanning different domains
- ➕ Multiple tags, comments, and history entries
- ➕ Diverse entity links
- ➕ Templates for common decision types

### 8. Documentation

- ➕ Architecture diagrams (component, data flow, integration)
- ➕ Domain model documentation with relationships
- ➕ API reference with examples
- ➕ Integration recipes (auth, notifications, knowledge graphs)
- ➕ Extension guide for adapters and events
- ➕ Deployment guide

## Success Criteria

Phase 3 will be considered complete when:

1. **Domain is rich**: 7+ entities with meaningful relationships
2. **Multiple flows work**: At least 4 complete vertical slices
3. **Extensible**: 5+ adapter interfaces with stub implementations
4. **Observable**: Logging, metrics, and event emission in place
5. **Well-tested**: 50+ tests covering validation, logic, integration, scenarios
6. **Production-ready**: Docker, migrations, comprehensive seed data
7. **Documented**: Architecture, API, integration guides all complete
8. **Reusable**: Clear extension points for ecosystem integration

## Timeline Estimate

- Domain expansion: 2-3 hours
- Vertical slices: 3-4 hours
- Extension points: 1-2 hours
- Observability: 1 hour
- Testing: 2-3 hours
- Seed data: 1 hour
- Documentation: 2 hours

**Total**: ~12-16 hours of focused development
