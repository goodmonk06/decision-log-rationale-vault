import { describe, it, expect } from 'vitest'
import { AppError, ValidationError, NotFoundError, ConflictError } from '../errors'

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with status code and message', () => {
      const error = new AppError(400, 'Bad Request', 'BAD_REQUEST')

      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Bad Request')
      expect(error.code).toBe('BAD_REQUEST')
      expect(error.name).toBe('AppError')
    })
  })

  describe('ValidationError', () => {
    it('should create a validation error with 400 status', () => {
      const errors = { field: 'invalid' }
      const error = new ValidationError('Validation failed', errors)

      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.errors).toEqual(errors)
      expect(error.name).toBe('ValidationError')
    })
  })

  describe('NotFoundError', () => {
    it('should create a not found error with 404 status', () => {
      const error = new NotFoundError('Decision')

      expect(error.statusCode).toBe(404)
      expect(error.message).toBe('Decision not found')
      expect(error.code).toBe('NOT_FOUND')
      expect(error.name).toBe('NotFoundError')
    })
  })

  describe('ConflictError', () => {
    it('should create a conflict error with 409 status', () => {
      const error = new ConflictError('Resource already exists')

      expect(error.statusCode).toBe(409)
      expect(error.message).toBe('Resource already exists')
      expect(error.code).toBe('CONFLICT')
      expect(error.name).toBe('ConflictError')
    })
  })
})
