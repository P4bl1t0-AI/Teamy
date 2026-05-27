'use client'

import { useMemo } from 'react'
import { DashboardTaskCard } from './DashboardTaskCard'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import type { Task, Profile } from '@/types'
import { useState } from 'react'
import { updateTask, deleteTask } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ClipboardList, Loader2, CheckCircle2 } from 'lucide-react'

interface DashboardTaskColumnsProps {
  tasks: Task[]
  myProfile: Profile
  members: Profile[]
  commentCounts: Record<string, number>
}

export function DashboardTaskColumns({ tasks, myProfile, members, commentCounts }: DashboardTaskColumnsProps) {
  const router = useRouter()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const { todo, inProgress, done } = useMemo(() => {
    const todo = tasks.filter((t) => t.status === 'todo' && t.assigned_to === myProfile.id)
    const inProgress = tasks.filter((t) => t.status === 'in_progress' && t.assigned_to === myProfile.id)
    const done = tasks.filter((t) => t.status === 'done' && t.assigned_to === myProfile.id)
    return { todo, inProgress, done }
  }, [tasks, myProfile.id])

  const isOverdue = (task: Task) => {
    if (!task.due_date) return false
    return new Date(task.due_date + 'T23:59:59') < new Date()
  }

  const isDeadlineSoon = (task: Task) => {
    if (!task.due_date) return false
    const due = new Date(task.due_date + 'T23:59:59')
    const now = new Date()
    const diffMs = due.getTime() - now.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 2
  }

  const handleUpdate = async (data: any) => {
    if (!selectedTask) return
    try {
      await updateTask(selectedTask.id, data)
      router.refresh()
      toast.success('Tâche mise à jour')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id)
      setSelectedTask(null)
      router.refresh()
      toast.success('Tâche supprimée')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  const Column = ({
    title,
    icon: Icon,
    tasks,
    color,
  }: {
    title: string
    icon: React.ElementType
    tasks: Task[]
    color: string
  }) => (
    <div className="flex flex-col min-w-0">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border-t border-x ${color}`}>
        <Icon size={14} />
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        <span className="ml-auto text-[10px] bg-background rounded-full px-1.5 py-0.5 border">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 bg-muted/20 border border-t-0 rounded-b-lg p-2 space-y-2 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground/50">
            Aucune tâche
          </div>
        ) : (
          tasks.map((task) => (
            <DashboardTaskCard
              key={task.id}
              task={task}
              myProfile={myProfile}
              members={members}
              commentCount={commentCounts[task.id] || 0}
              overdue={isOverdue(task)}
              deadlineSoon={isDeadlineSoon(task)}
              onClick={setSelectedTask}
            />
          ))
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Column
          title="À faire"
          icon={ClipboardList}
          tasks={todo}
          color="bg-amber-50/70 text-amber-700 border-amber-200"
        />
        <Column
          title="En cours"
          icon={Loader2}
          tasks={inProgress}
          color="bg-blue-50/70 text-blue-700 border-blue-200"
        />
        <Column
          title="Terminé"
          icon={CheckCircle2}
          tasks={done}
          color="bg-emerald-50/70 text-emerald-700 border-emerald-200"
        />
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
          onSubmit={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
