'use client'

import { Badge } from '@/components/ui/badge'
import { TASK_STATUS_LABELS } from '@/lib/constants'
import type { TaskStatus } from '@/types'
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'

const icons: Record<TaskStatus, React.ReactNode> = {
  todo: <Clock size={12} className="mr-1" />,
  in_progress: <Loader2 size={12} className="mr-1 animate-spin" />,
  done: <CheckCircle2 size={12} className="mr-1" />,
  cancelled: <XCircle size={12} className="mr-1" />,
}

const variants: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  in_progress: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  done: 'bg-green-100 text-green-700 hover:bg-green-200',
  cancelled: 'bg-gray-100 text-gray-500 line-through hover:bg-gray-200',
}

export function StatusBadge({ status, onClick }: { status: TaskStatus; onClick?: () => void }) {
  return (
    <Badge
      className={`cursor-pointer ${variants[status]} ${onClick ? '' : 'pointer-events-none'}`}
      onClick={onClick}
    >
      {icons[status]}
      {TASK_STATUS_LABELS[status]}
    </Badge>
  )
}
