import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { DecisionWithRelations } from '@/types'
import TimelineView from '@/components/TimelineView'

export const dynamic = 'force-dynamic'

async function searchDecisions(query: string): Promise<DecisionWithRelations[]> {
  const decisions = await prisma.decision.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { descriptionMarkdown: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      options: true,
      links: true,
    },
    orderBy: {
      decidedAt: 'desc',
    },
  })
  return decisions
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = params.q || ''
  const decisions = query ? await searchDecisions(query) : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 mb-6"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Timeline
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Search Results
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {query ? (
              <>
                Found {decisions.length} result{decisions.length !== 1 ? 's' : ''} for &quot;{query}&quot;
              </>
            ) : (
              'Enter a search query to find decisions'
            )}
          </p>
        </div>

        {query && decisions.length > 0 && <TimelineView decisions={decisions} />}

        {query && decisions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No decisions found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
