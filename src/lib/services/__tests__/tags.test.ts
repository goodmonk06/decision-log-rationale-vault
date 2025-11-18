import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as tagService from '../tags'
import { eventEmitter } from '../../events'

// Mock Prisma
vi.mock('../../prisma', () => ({
  prisma: {
    tag: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    decisionTagAssignment: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('Tag Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTag', () => {
    it('should create a tag with slug', async () => {
      const mockTag = {
        id: 'tag1',
        name: 'Architecture',
        slug: 'architecture',
        description: 'Architecture decisions',
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { prisma } = await import('../../prisma')
      vi.mocked(prisma.tag.create).mockResolvedValue(mockTag)

      const result = await tagService.createTag({
        name: 'Architecture',
        description: 'Architecture decisions',
        color: '#3B82F6',
      })

      expect(result).toEqual(mockTag)
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          name: 'Architecture',
          slug: 'architecture',
          description: 'Architecture decisions',
          color: '#3B82F6',
        },
      })
    })

    it('should handle special characters in slug', async () => {
      const mockTag = {
        id: 'tag2',
        name: 'API Design & Patterns',
        slug: 'api-design--patterns',
        description: null,
        color: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const { prisma } = await import('../../prisma')
      vi.mocked(prisma.tag.create).mockResolvedValue(mockTag)

      await tagService.createTag({
        name: 'API Design & Patterns',
      })

      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: expect.stringMatching(/^[a-z0-9-]+$/),
        }),
      })
    })
  })

  describe('assignTagToDecision', () => {
    it('should assign tag and emit event', async () => {
      const mockAssignment = {
        id: 'assignment1',
        decisionId: 'decision1',
        tagId: 'tag1',
        createdAt: new Date(),
        tag: {
          id: 'tag1',
          name: 'Architecture',
          slug: 'architecture',
          description: null,
          color: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        decision: {
          id: 'decision1',
          title: 'Use PostgreSQL',
        },
      }

      const { prisma } = await import('../../prisma')
      vi.mocked(prisma.decisionTagAssignment.create).mockResolvedValue(mockAssignment as any)

      const emitSpy = vi.spyOn(eventEmitter, 'emit')

      await tagService.assignTagToDecision('decision1', 'tag1', 'user1')

      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tag.assigned',
          payload: expect.objectContaining({
            decisionId: 'decision1',
            tagId: 'tag1',
            tagName: 'Architecture',
          }),
        })
      )
    })
  })
})
