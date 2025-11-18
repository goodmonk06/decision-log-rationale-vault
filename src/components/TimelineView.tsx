import Link from 'next/link'
import { DecisionWithRelations } from '@/types'

interface TimelineViewProps {
  decisions: DecisionWithRelations[]
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

export default function TimelineView({ decisions }: TimelineViewProps) {
  if (decisions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No decisions yet. Create your first decision to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        {decisions.map((decision, index) => (
          <div key={decision.id} className="relative flex gap-6 pb-8">
            {/* Timeline dot */}
            <div className="relative z-10 flex items-start">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-800 border-4 border-blue-500 dark:border-blue-400">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {new Date(decision.decidedAt).toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Decision card */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <Link href={`/decisions/${decision.id}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        {decision.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(decision.decidedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[decision.status]}`}>
                      {decision.status}
                    </span>
                  </div>

                  {decision.descriptionMarkdown && (
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                      {decision.descriptionMarkdown}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    {decision.options.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">
                          Options:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {decision.options.length}
                        </span>
                        {decision.options.some(opt => opt.chosen) && (
                          <span className="text-green-600 dark:text-green-400">
                            ({decision.options.filter(opt => opt.chosen).length} chosen)
                          </span>
                        )}
                      </div>
                    )}

                    {decision.links.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500 dark:text-gray-400">
                          Links:
                        </span>
                        {decision.links.slice(0, 3).map(link => (
                          <span
                            key={link.id}
                            className={`px-2 py-1 rounded text-xs font-medium ${entityTypeColors[link.entityType]}`}
                          >
                            {link.entityType}: {link.entityIdOrRef}
                          </span>
                        ))}
                        {decision.links.length > 3 && (
                          <span className="text-gray-500 dark:text-gray-400">
                            +{decision.links.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
