import { prisma } from '../prisma'
import { logger } from '../observability/logger'
import { metrics } from '../observability/metrics'
import { eventEmitter } from '../events'
import { NotFoundError } from '../errors'

export async function createTag(data: {
  name: string
  description?: string
  color?: string
}) {
  const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  const tag = await prisma.tag.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      color: data.color,
    },
  })

  logger.info('Tag created', { tagId: tag.id, name: tag.name })
  metrics.counter('tags.created')

  return tag
}

export async function assignTagToDecision(decisionId: string, tagId: string, userId?: string) {
  const assignment = await prisma.decisionTagAssignment.create({
    data: {
      decisionId,
      tagId,
    },
    include: {
      tag: true,
      decision: true,
    },
  })

  await eventEmitter.emit({
    id: assignment.id,
    type: 'tag.assigned',
    timestamp: new Date(),
    userId,
    payload: {
      decisionId,
      tagId,
      tagName: assignment.tag.name,
    },
  })

  logger.info('Tag assigned to decision', { decisionId, tagId })
  metrics.counter('tags.assigned')

  return assignment
}

export async function removeTagFromDecision(decisionId: string, tagId: string) {
  await prisma.decisionTagAssignment.deleteMany({
    where: {
      decisionId,
      tagId,
    },
  })

  logger.info('Tag removed from decision', { decisionId, tagId })
  metrics.counter('tags.removed')
}

export async function getTagsForDecision(decisionId: string) {
  const assignments = await prisma.decisionTagAssignment.findMany({
    where: { decisionId },
    include: { tag: true },
  })

  return assignments.map(a => a.tag)
}

export async function getDecisionsWithTag(tagId: string) {
  const assignments = await prisma.decisionTagAssignment.findMany({
    where: { tagId },
    include: {
      decision: {
        include: {
          options: true,
          links: true,
        },
      },
    },
  })

  return assignments.map(a => a.decision)
}

export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function getTagBySlug(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: { slug },
  })

  if (!tag) {
    throw new NotFoundError('Tag')
  }

  return tag
}
