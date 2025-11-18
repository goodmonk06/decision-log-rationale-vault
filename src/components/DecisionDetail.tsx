'use client'

import { DecisionWithRelations } from '@/types'
import ReactMarkdown from 'react-markdown'

interface DecisionDetailProps {
  decision: DecisionWithRelations
}

const statusColors = {
  PROPOSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  DECIDED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  DEPRECATED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

const entityTypeColors = {
  PROJECT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PERSON: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  REPO: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export default function DecisionDetail({ decision }: DecisionDetailProps) {
  const chosenOptions = decision.options.filter(opt => opt.chosen)
  const otherOptions = decision.options.filter(opt => !opt.chosen)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {decision.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Decided on {new Date(decision.decidedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[decision.status]}`}>
            {decision.status}
          </span>
        </div>

        {decision.descriptionMarkdown && (
          <div className="prose dark:prose-invert max-w-none mt-6">
            <ReactMarkdown>{decision.descriptionMarkdown}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Options */}
      {decision.options.length > 0 && (
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Options Considered
          </h2>

          {/* Chosen Options */}
          {chosenOptions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-green-600 dark:text-green-400 mb-4">
                ✓ Chosen Options
              </h3>
              <div className="space-y-4">
                {chosenOptions.map(option => (
                  <div
                    key={option.id}
                    className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {option.title}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {option.prosMarkdown && (
                        <div>
                          <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">
                            Pros
                          </h5>
                          <div className="prose dark:prose-invert prose-sm">
                            <ReactMarkdown>{option.prosMarkdown}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {option.consMarkdown && (
                        <div>
                          <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">
                            Cons
                          </h5>
                          <div className="prose dark:prose-invert prose-sm">
                            <ReactMarkdown>{option.consMarkdown}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Options */}
          {otherOptions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-4">
                Other Options Considered
              </h3>
              <div className="space-y-4">
                {otherOptions.map(option => (
                  <div
                    key={option.id}
                    className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {option.title}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {option.prosMarkdown && (
                        <div>
                          <h5 className="font-medium text-green-700 dark:text-green-300 mb-2">
                            Pros
                          </h5>
                          <div className="prose dark:prose-invert prose-sm">
                            <ReactMarkdown>{option.prosMarkdown}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {option.consMarkdown && (
                        <div>
                          <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">
                            Cons
                          </h5>
                          <div className="prose dark:prose-invert prose-sm">
                            <ReactMarkdown>{option.consMarkdown}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Links */}
      {decision.links.length > 0 && (
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Related Entities
          </h2>
          <div className="space-y-3">
            {decision.links.map(link => (
              <div
                key={link.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${entityTypeColors[link.entityType]}`}>
                  {link.entityType}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {link.entityIdOrRef}
                </span>
                {link.metaJson && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {JSON.stringify(link.metaJson)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {decision.metaJson && (
        <div className="p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Metadata
          </h2>
          <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
            {JSON.stringify(decision.metaJson, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
