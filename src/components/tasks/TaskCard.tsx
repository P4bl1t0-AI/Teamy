'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TaskPriority } from '@/types'
import { PriorityBadge } from './PriorityBadge'
import { CalendarDays, GripVertical } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

const priorityBorder: Record<TaskPriority, string> = {
  high: 'border-l-red-400',
  medium: 'border-l-amber-400',
  low: 'border-l-emerald-400',
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-md shadow-sm border border-border border-l-4 ${priorityBorder[task.priority]} p-3 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 rotate-2 shadow-lg z-50' : ''
      }`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} className="text-muted-foreground" />
      </div>

      {/* Titre */}
      <div className="font-medium text-sm pr-5 line-clamp-2 mb-1.5">
        {task.title}
      </div>

      {/* Description (extrait) */}
      {task.description && (
        <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {task.description}
        </div>
      )}

      {/* Footer : priorité + échéance */}
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        {task.due_date && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <CalendarDays size={10} />
            {new Date(task.due_date + 'T12:00:00').toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
        )}
      </div>
    </div>
  )
}
