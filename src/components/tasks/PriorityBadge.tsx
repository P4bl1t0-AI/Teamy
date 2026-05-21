'use client'

import { Badge } from '@/components/ui/badge'
import { TASK_PRIORITY_LABELS } from '@/lib/constants'
import type { TaskPriority } from '@/types/database'

const variants: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700 hover:bg-red-200',
  medium: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  low: 'bg-green-100 text-green-700 hover:bg-green-200',
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={variants[priority]}>{TASK_PRIORITY_LABELS[priority]}</Badge>
}
