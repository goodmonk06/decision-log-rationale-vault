import { prisma } from '../prisma'
import { HistoryAction } from '@prisma/client'
import { logger } from '../observability/logger'

export async function recordHistory(data: {
  decisionId: string
  userId?: string
  action: HistoryAction
  fieldName?: string
  oldValue?: string
  newValue?: string
  metaJson?: any
}) {
  const history = await prisma.decisionHistory.create({
    data,
  })

  logger.debug('History recorded', {
    historyId: history.id,
    action: data.action,
    decisionId: data.decisionId,
  })

  return history
}

export async function getDecisionHistory(decisionId: string) {
  return prisma.decisionHistory.findMany({
    where: { decisionId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })
}
