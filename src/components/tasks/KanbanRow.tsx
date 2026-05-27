'use client'

import type { Task, TaskStatus } from '@/types'
import { KanbanColumn } from './KanbanColumn'
import { cn } from '@/lib/utils'

interface KanbanRowProps {
  title: string
  subtitle?: string
  avatar?: string
  columns: { id: TaskStatus; label: string }[]
  tasks: Task[]
  rowId: string
  colorHeader?: string
  onTaskClick: (task: Task) => void
}

const columnColors: Record<TaskStatus, string> = {
  todo: 'bg-amber-50/70 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50/70 text-blue-700 border-blue-200',
  done: 'bg-emerald-50/70 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-50/70 text-slate-600 border-slate-200',
}

export function KanbanRow({
  title,
  subtitle,
  avatar,
  columns,
  tasks,
  rowId,
  colorHeader,
  onTaskClick,
}: KanbanRowProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Row header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2 border-b',
          colorHeader ?? 'bg-background'
        )}
      >
        {avatar && (
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">
            {avatar}
          </div>
        )}
        <div>
          <span className="font-semibold text-sm">{title}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground ml-2">{subtitle}</span>
          )}
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-2 p-2 bg-muted/10">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          const colId = `${rowId}:${col.id}`
          return (
            <KanbanColumn
              key={colId}
              id={colId}
              title={col.label}
              tasks={colTasks}
              colorClass={columnColors[col.id]}
              onTaskClick={onTaskClick}
            />
          )
        })}
      </div>
    </div>
  )
}
