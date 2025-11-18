'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DecisionStatus, EntityType } from '@/types'

interface Option {
  title: string
  prosMarkdown: string
  consMarkdown: string
  chosen: boolean
}

interface Link {
  entityType: EntityType
  entityIdOrRef: string
  metaJson?: any
}

export default function DecisionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [descriptionMarkdown, setDescriptionMarkdown] = useState('')
  const [status, setStatus] = useState<DecisionStatus>('PROPOSED')
  const [decidedAt, setDecidedAt] = useState(new Date().toISOString().slice(0, 16))

  const [options, setOptions] = useState<Option[]>([
    { title: '', prosMarkdown: '', consMarkdown: '', chosen: false }
  ])

  const [links, setLinks] = useState<Link[]>([
    { entityType: 'PROJECT', entityIdOrRef: '' }
  ])

  const addOption = () => {
    setOptions([...options, { title: '', prosMarkdown: '', consMarkdown: '', chosen: false }])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, field: keyof Option, value: any) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const addLink = () => {
    setLinks([...links, { entityType: 'PROJECT', entityIdOrRef: '' }])
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, field: keyof Link, value: any) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          descriptionMarkdown,
          status,
          decidedAt: new Date(decidedAt).toISOString(),
          options: options.filter(opt => opt.title.trim()),
          links: links.filter(link => link.entityIdOrRef.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create decision')
      }

      const decision = await response.json()
      router.push(`/decisions/${decision.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Decision Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Use PostgreSQL for primary database"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Markdown)
          </label>
          <textarea
            id="description"
            value={descriptionMarkdown}
            onChange={(e) => setDescriptionMarkdown(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono"
            placeholder="Provide context and background for this decision..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as DecisionStatus)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="PROPOSED">Proposed</option>
              <option value="DECIDED">Decided</option>
              <option value="DEPRECATED">Deprecated</option>
            </select>
          </div>

          <div>
            <label htmlFor="decidedAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Decision Date
            </label>
            <input
              type="datetime-local"
              id="decidedAt"
              value={decidedAt}
              onChange={(e) => setDecidedAt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Options Considered
          </h2>
          <button
            type="button"
            onClick={addOption}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Option
          </button>
        </div>

        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Option {index + 1}
                </h3>
                {options.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={option.title}
                    onChange={(e) => updateOption(index, 'title', e.target.value)}
                    placeholder="Option title"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pros (Markdown)
                    </label>
                    <textarea
                      value={option.prosMarkdown}
                      onChange={(e) => updateOption(index, 'prosMarkdown', e.target.value)}
                      rows={4}
                      placeholder="- Pro 1\n- Pro 2"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cons (Markdown)
                    </label>
                    <textarea
                      value={option.consMarkdown}
                      onChange={(e) => updateOption(index, 'consMarkdown', e.target.value)}
                      rows={4}
                      placeholder="- Con 1\n- Con 2"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`chosen-${index}`}
                    checked={option.chosen}
                    onChange={(e) => updateOption(index, 'chosen', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`chosen-${index}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    This option was chosen
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Related Entities
          </h2>
          <button
            type="button"
            onClick={addLink}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Link
          </button>
        </div>

        <div className="space-y-4">
          {links.map((link, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-4">
                <select
                  value={link.entityType}
                  onChange={(e) => updateLink(index, 'entityType', e.target.value as EntityType)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="PROJECT">Project</option>
                  <option value="PERSON">Person</option>
                  <option value="REPO">Repository</option>
                  <option value="OTHER">Other</option>
                </select>

                <input
                  type="text"
                  value={link.entityIdOrRef}
                  onChange={(e) => updateLink(index, 'entityIdOrRef', e.target.value)}
                  placeholder="Entity ID or reference"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />

                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Creating...' : 'Create Decision'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
