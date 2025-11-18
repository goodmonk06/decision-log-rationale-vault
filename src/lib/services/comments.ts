import { prisma } from '../prisma'
import { logger } from '../observability/logger'
import { metrics } from '../observability/metrics'
import { eventEmitter } from '../events'

export async function createComment(data: {
  decisionId: string
  userId?: string
  content: string
  parentId?: string
}) {
  const comment = await prisma.decisionComment.create({
    data: {
      decisionId: data.decisionId,
      userId: data.userId,
      content: data.content,
      parentId: data.parentId,
    },
    include: {
      user: true,
      replies: true,
    },
  })

  await eventEmitter.emit({
    id: comment.id,
    type: 'comment.added',
    timestamp: new Date(),
    userId: data.userId,
    payload: {
      decisionId: data.decisionId,
      commentId: comment.id,
      content: data.content,
    },
  })

  logger.info('Comment added', { commentId: comment.id, decisionId: data.decisionId })
  metrics.counter('comments.created')

  return comment
}

export async function getCommentsForDecision(decisionId: string) {
  return prisma.decisionComment.findMany({
    where: {
      decisionId,
      parentId: null, // Only top-level comments
    },
    include: {
      user: true,
      replies: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function updateComment(id: string, content: string) {
  const comment = await prisma.decisionComment.update({
    where: { id },
    data: { content },
  })

  logger.info('Comment updated', { commentId: id })
  return comment
}

export async function deleteComment(id: string) {
  await prisma.decisionComment.delete({
    where: { id },
  })

  logger.info('Comment deleted', { commentId: id })
  metrics.counter('comments.deleted')
}
