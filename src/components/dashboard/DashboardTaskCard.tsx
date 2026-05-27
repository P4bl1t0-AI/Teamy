'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PriorityBadge } from '@/components/tasks/PriorityBadge'
import type { Task, Profile } from '@/types'
import { updateTaskQuick } from '@/app/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { MessageSquare, Play, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

interface DashboardTaskCardProps {
  task: Task
  myProfile: Profile
  members: Profile[]
  commentCount?: number
  overdue?: boolean
  deadlineSoon?: boolean
  onClick: (task: Task) => void
}

export function DashboardTaskCard({
  task,
  myProfile,
  members,
  commentCount = 0,
  overdue,
  deadlineSoon,
  onClick,
}: DashboardTaskCardProps) {
  const router = useRouter()

  const assigneeName = useMemo(() => {
    if (!task.assigned_to) return null
    return members.find((m) => m.id === task.assigned_to)?.full_name || null
  }, [task.assigned_to, members])

  const isAssignedToMe = task.assigned_to === myProfile.id

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateTaskQuick(task.id, { status: 'in_progress' })
      router.refresh()
      toast.success('Tâche démarrée')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateTaskQuick(task.id, { status: 'done' })
      router.refresh()
      toast.success('Tâche terminée')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  const borderClass = overdue
    ? 'border-red-300 shadow-red-100'
    : deadlineSoon
    ? 'border-amber-300 shadow-amber-100'
    : 'border-border'

  return (
    <div
      className={`bg-white rounded-lg border p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow ${borderClass} ${
        overdue || deadlineSoon ? 'shadow-sm' : ''
      }`}
      onClick={() => onClick(task)}
    >
      {/* Header : titre + badges */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight flex-1">{task.title}</h4>
          {overdue && (
            <Badge variant="destructive" className="shrink-0 text-[10px] h-5 px-1.5">
              <AlertTriangle size={10} className="mr-0.5" />
              Retard
            </Badge>
          )}
          {deadlineSoon && !overdue && (
            <Badge variant="outline" className="shrink-0 text-[10px] h-5 px-1.5 border-amber-300 text-amber-700 bg-amber-50">
              <Clock size={10} className="mr-0.5" />
              Bientôt
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {assigneeName && (
            <span className="text-[10px] text-muted-foreground">
              {isAssignedToMe ? 'À vous' : assigneeName}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      {/* Échéance + commentaires */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        {task.due_date ? (
          <span>
            {overdue ? 'Échéance : ' : 'Pour le '}
            {new Date(task.due_date + 'T12:00:00').toLocaleDateString('fr-FR')}
          </span>
        ) : (
          <span>Pas d&apos;échéance</span>
        )}
        {commentCount > 0 && (
          <span className="flex items-center gap-0.5">
            <MessageSquare size={10} />
            {commentCount}
          </span>
        )}
      </div>

      {/* Action rapide */}
      <div className="pt-1">
        {task.status === 'todo' && (
          <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={handleStart}>
            <Play size={12} className="mr-1" />
            Démarrer
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={handleComplete}>
            <CheckCircle size={12} className="mr-1" />
            Terminer
          </Button>
        )}
        {task.status === 'done' && (
          <div className="flex items-center justify-center gap-1 text-xs text-emerald-600 py-1">
            <CheckCircle size={14} />
            Terminée
          </div>
        )}
      </div>
    </div>
  )
}
