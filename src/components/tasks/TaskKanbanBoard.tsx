'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Task, TaskStatus, Profile } from '@/types'
import { TaskCard } from './TaskCard'
import { KanbanRow } from './KanbanRow'
import { TaskDetailModal } from './TaskDetailModal'
import { ReopenDialog } from './ReopenDialog'
import { updateTaskQuick, addTaskComment } from '@/app/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'À faire' },
  { id: 'in_progress', label: 'En cours' },
  { id: 'done', label: 'Terminé' },
]

interface TaskKanbanBoardProps {
  tasks: Task[]
  members: Profile[]
  currentProfileId: string
}

export function TaskKanbanBoard({ tasks, members, currentProfileId }: TaskKanbanBoardProps) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [reopenTask, setReopenTask] = useState<{ task: Task; assigneeId: string; newStatus: TaskStatus } | null>(null)

  const membersMap = useMemo(() => {
    const map = new Map<string, string>()
    members.forEach((m) => map.set(m.id, m.full_name))
    return map
  }, [members])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeId) ?? null,
    [activeId, tasks]
  )

  const getColumnId = (task: Task): string => {
    const assignee = task.assigned_to ?? 'unassigned'
    return `${assignee}:${task.status}`
  }

  const parseColumnId = (colId: string) => {
    const [assigneeId, status] = colId.split(':')
    return { assigneeId, status: status as TaskStatus }
  }

  const canDrop = (task: Task, targetColId: string): boolean => {
    const { assigneeId, status } = parseColumnId(targetColId)

    // WIP limit: max 3 tasks per member in todo + in_progress combined
    if (assigneeId !== 'unassigned' && status !== 'done') {
      const memberWipTasks = tasks.filter(
        (t) =>
          t.assigned_to === assigneeId &&
          t.id !== task.id && // exclude current task
          (t.status === 'todo' || t.status === 'in_progress')
      )
      if (memberWipTasks.length >= 3) {
        return false
      }
    }

    return true
  }

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    // Visual feedback only — actual drop validated on dragEnd
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over) return

      const task = tasks.find((t) => t.id === active.id)
      if (!task) return

      const overId = over.id as string
      const { assigneeId, status: newStatus } = parseColumnId(overId)

      // Same column → no change
      const currentColId = getColumnId(task)
      if (currentColId === overId) return

      // WIP limit check
      if (!canDrop(task, overId)) {
        const memberName = assigneeId === 'unassigned'
          ? 'Non assigné'
          : membersMap.get(assigneeId) || 'Ce membre'
        toast.error(`Limite WIP atteinte : ${memberName} a déjà 3 tâches À faire / En cours`)
        return
      }

      // Reopening detection (done → todo or done → in_progress)
      if (task.status === 'done' && newStatus !== 'done') {
        setReopenTask({ task, assigneeId, newStatus })
        return
      }

      // Apply changes
      try {
        await updateTaskQuick(task.id, {
          status: newStatus,
          assigned_to: assigneeId === 'unassigned' ? null : assigneeId,
        })
        router.refresh()
        toast.success('Tâche mise à jour')
      } catch (e: any) {
        toast.error(e.message || 'Erreur')
      }
    },
    [tasks, membersMap, router]
  )

  const handleReopenConfirm = async (comment: string) => {
    if (!reopenTask) return
    try {
      await updateTaskQuick(reopenTask.task.id, {
        status: reopenTask.newStatus,
        assigned_to: reopenTask.assigneeId === 'unassigned' ? null : reopenTask.assigneeId,
      })
      await addTaskComment(reopenTask.task.id, `[Réouverture] ${comment}`)
      setReopenTask(null)
      router.refresh()
      toast.success('Tâche réouverte avec commentaire')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  // Group tasks
  const unassignedTasks = useMemo(
    () => tasks.filter((t) => !t.assigned_to).sort((a, b) => sortByDueDate(a, b)),
    [tasks]
  )

  const memberTasks = useMemo(() => {
    return members.map((member) => ({
      member,
      tasks: tasks
        .filter((t) => t.assigned_to === member.id)
        .sort((a, b) => sortByDueDate(a, b)),
    }))
  }, [tasks, members])

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {/* ─── Unassigned row ─── */}
          <KanbanRow
            title="Non assignées"
            subtitle="Glisser sur un membre pour assigner"
            columns={COLUMNS}
            tasks={unassignedTasks}
            rowId="unassigned"
            colorHeader="bg-slate-100"
            onTaskClick={setSelectedTask}
          />

          {/* ─── Member rows ─── */}
          {memberTasks.map(({ member, tasks }) => (
            <KanbanRow
              key={member.id}
              title={member.full_name}
              avatar={member.full_name.charAt(0).toUpperCase()}
              columns={COLUMNS}
              tasks={tasks}
              rowId={member.id}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ─── Modals ─── */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {reopenTask && (
        <ReopenDialog
          task={reopenTask.task}
          onConfirm={handleReopenConfirm}
          onCancel={() => setReopenTask(null)}
        />
      )}
    </>
  )
}

function sortByDueDate(a: Task, b: Task): number {
  if (!a.due_date && !b.due_date) return 0
  if (!a.due_date) return 1
  if (!b.due_date) return -1
  return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
}
