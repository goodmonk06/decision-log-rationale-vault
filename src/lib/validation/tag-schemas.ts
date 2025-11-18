import { z } from 'zod'

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export const AssignTagSchema = z.object({
  decisionId: z.string().cuid(),
  tagId: z.string().cuid(),
})

export type CreateTagInput = z.infer<typeof CreateTagSchema>
export type AssignTagInput = z.infer<typeof AssignTagSchema>
