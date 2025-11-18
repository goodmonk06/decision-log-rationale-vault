import { z } from 'zod'

// Enums
export const DecisionStatusSchema = z.enum(['PROPOSED', 'DECIDED', 'DEPRECATED'])
export const EntityTypeSchema = z.enum(['PROJECT', 'PERSON', 'REPO', 'OTHER'])

// Decision schemas
export const CreateDecisionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  descriptionMarkdown: z.string().optional(),
  decidedAt: z.string().datetime().optional(),
  status: DecisionStatusSchema.optional(),
  metaJson: z.record(z.string(), z.any()).optional(),
  options: z.array(z.object({
    title: z.string().min(1),
    prosMarkdown: z.string().optional(),
    consMarkdown: z.string().optional(),
    chosen: z.boolean().optional(),
  })).optional(),
  links: z.array(z.object({
    entityType: EntityTypeSchema,
    entityIdOrRef: z.string().min(1),
    metaJson: z.record(z.string(), z.any()).optional(),
  })).optional(),
})

export const UpdateDecisionSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  descriptionMarkdown: z.string().optional(),
  decidedAt: z.string().datetime().optional(),
  status: DecisionStatusSchema.optional(),
  metaJson: z.record(z.string(), z.any()).optional(),
})

export const DecisionQuerySchema = z.object({
  search: z.string().optional(),
  status: DecisionStatusSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
})

// Option schemas
export const CreateOptionSchema = z.object({
  decisionId: z.string().cuid(),
  title: z.string().min(1).max(500),
  prosMarkdown: z.string().optional(),
  consMarkdown: z.string().optional(),
  chosen: z.boolean().optional(),
})

export const UpdateOptionSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  prosMarkdown: z.string().optional(),
  consMarkdown: z.string().optional(),
  chosen: z.boolean().optional(),
})

// Link schemas
export const CreateLinkSchema = z.object({
  decisionId: z.string().cuid(),
  entityType: EntityTypeSchema,
  entityIdOrRef: z.string().min(1).max(500),
  metaJson: z.record(z.string(), z.any()).optional(),
})

export const UpdateLinkSchema = z.object({
  entityType: EntityTypeSchema.optional(),
  entityIdOrRef: z.string().min(1).max(500).optional(),
  metaJson: z.record(z.string(), z.any()).optional(),
})

// Type exports
export type CreateDecisionInput = z.infer<typeof CreateDecisionSchema>
export type UpdateDecisionInput = z.infer<typeof UpdateDecisionSchema>
export type DecisionQuery = z.infer<typeof DecisionQuerySchema>
export type CreateOptionInput = z.infer<typeof CreateOptionSchema>
export type UpdateOptionInput = z.infer<typeof UpdateOptionSchema>
export type CreateLinkInput = z.infer<typeof CreateLinkSchema>
export type UpdateLinkInput = z.infer<typeof UpdateLinkSchema>
