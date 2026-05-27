'use client'

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Task } from '@/types'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  colorClass?: string
  onTaskClick: (task: Task) => void
  disabled?: boolean
}

export function KanbanColumn({
  id,
  title,
  tasks,
  colorClass,
  onTaskClick,
  disabled,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { columnId: id },
    disabled,
  })

  return (
    <div className="flex flex-col h-full min-w-[180px] max-w-[260px]">
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-2 py-1.5 rounded-t-md border-t border-x text-xs font-semibold uppercase tracking-wider',
          colorClass ?? 'bg-muted/50 text-muted-foreground'
        )}
      >
        <span>{title}</span>
        <span className="text-[10px] bg-background rounded-full px-1.5 py-0.5 border">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 bg-muted/20 border border-t-0 rounded-b-md p-1.5 space-y-2 min-h-[120px] transition-colors',
          isOver && !disabled && 'bg-primary/5 border-primary/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="h-20 flex items-center justify-center text-xs text-muted-foreground/50">
              Glisser ici
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
