import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { DecisionWithRelations } from '@/types'
import TimelineView from '@/components/TimelineView'
import SearchBar from '@/components/SearchBar'

export const dynamic = 'force-dynamic'

async function getDecisions(): Promise<DecisionWithRelations[]> {
  const decisions = await prisma.decision.findMany({
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

export default async function Home() {
  const decisions = await getDecisions()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Decision Log Vault
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Track important decisions, their context, and rationale
              </p>
            </div>
            <Link
              href="/decisions/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Decision
            </Link>
          </div>
          <SearchBar />
        </div>

        <TimelineView decisions={decisions} />
      </div>
    </div>
  )
}
