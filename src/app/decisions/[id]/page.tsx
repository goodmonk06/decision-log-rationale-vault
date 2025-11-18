import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DecisionWithRelations } from '@/types'
import DecisionDetail from '@/components/DecisionDetail'

export const dynamic = 'force-dynamic'

async function getDecision(id: string): Promise<DecisionWithRelations | null> {
  const decision = await prisma.decision.findUnique({
    where: { id },
    include: {
      options: true,
      links: true,
    },
  })
  return decision
}

export default async function DecisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const decision = await getDecision(id)

  if (!decision) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
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
        </div>

        <DecisionDetail decision={decision} />
      </div>
    </div>
  )
}
