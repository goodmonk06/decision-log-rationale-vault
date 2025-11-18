import { Decision, DecisionOption, DecisionLink, DecisionStatus, EntityType } from '@prisma/client'

export type DecisionWithRelations = Decision & {
  options: DecisionOption[]
  links: DecisionLink[]
}

export { DecisionStatus, EntityType }
export type { Decision, DecisionOption, DecisionLink }
