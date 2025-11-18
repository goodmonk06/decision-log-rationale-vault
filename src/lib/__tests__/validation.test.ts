import { describe, it, expect } from 'vitest'
import {
  CreateDecisionSchema,
  UpdateDecisionSchema,
  DecisionQuerySchema,
  CreateOptionSchema,
  CreateLinkSchema,
} from '../validation/schemas'

describe('Validation Schemas', () => {
  describe('CreateDecisionSchema', () => {
    it('should validate valid decision creation data', () => {
      const validData = {
        title: 'Use PostgreSQL',
        descriptionMarkdown: 'We chose PostgreSQL for its robustness',
        status: 'DECIDED' as const,
      }

      const result = CreateDecisionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject decision without title', () => {
      const invalidData = {
        descriptionMarkdown: 'Description without title',
      }

      const result = CreateDecisionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject decision with invalid status', () => {
      const invalidData = {
        title: 'Valid title',
        status: 'INVALID_STATUS',
      }

      const result = CreateDecisionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate decision with options and links', () => {
      const validData = {
        title: 'Architecture Decision',
        options: [
          {
            title: 'Option 1',
            prosMarkdown: '- Pro 1',
            consMarkdown: '- Con 1',
            chosen: true,
          },
        ],
        links: [
          {
            entityType: 'PROJECT' as const,
            entityIdOrRef: 'project-123',
          },
        ],
      }

      const result = CreateDecisionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('UpdateDecisionSchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = {
        title: 'Updated title',
      }

      const result = UpdateDecisionSchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
    })

    it('should allow empty updates', () => {
      const emptyUpdate = {}

      const result = UpdateDecisionSchema.safeParse(emptyUpdate)
      expect(result.success).toBe(true)
    })
  })

  describe('DecisionQuerySchema', () => {
    it('should validate query parameters', () => {
      const validQuery = {
        search: 'postgresql',
        status: 'DECIDED' as const,
        limit: '10',
        offset: '0',
      }

      const result = DecisionQuerySchema.safeParse(validQuery)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(10)
        expect(result.data.offset).toBe(0)
      }
    })

    it('should reject limit over 100', () => {
      const invalidQuery = {
        limit: '200',
      }

      const result = DecisionQuerySchema.safeParse(invalidQuery)
      expect(result.success).toBe(false)
    })
  })

  describe('CreateOptionSchema', () => {
    it('should validate option creation', () => {
      const validOption = {
        decisionId: 'cld1234567890',
        title: 'Option A',
        prosMarkdown: '- Fast',
        consMarkdown: '- Expensive',
        chosen: true,
      }

      const result = CreateOptionSchema.safeParse(validOption)
      expect(result.success).toBe(true)
    })

    it('should require decisionId and title', () => {
      const invalidOption = {
        prosMarkdown: '- Pro 1',
      }

      const result = CreateOptionSchema.safeParse(invalidOption)
      expect(result.success).toBe(false)
    })
  })

  describe('CreateLinkSchema', () => {
    it('should validate link creation', () => {
      const validLink = {
        decisionId: 'cld1234567890',
        entityType: 'PROJECT' as const,
        entityIdOrRef: 'auth-service',
      }

      const result = CreateLinkSchema.safeParse(validLink)
      expect(result.success).toBe(true)
    })

    it('should reject invalid entity type', () => {
      const invalidLink = {
        decisionId: 'cld1234567890',
        entityType: 'INVALID',
        entityIdOrRef: 'test',
      }

      const result = CreateLinkSchema.safeParse(invalidLink)
      expect(result.success).toBe(false)
    })
  })
})
