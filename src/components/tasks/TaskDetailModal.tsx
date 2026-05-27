'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import type { Task, Profile } from '@/types'
import { getTaskComments, addTaskComment } from '@/app/actions'
import { toast } from 'sonner'
import { Send, User, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TaskDetailModalProps {
  task: Task
  members: Profile[]
  onClose: () => void
}

type CommentWithProfile = {
  id: string
  content: string
  created_at: string
  profiles: { id: string; full_name: string } | null
}

export function TaskDetailModal({ task, members, onClose }: TaskDetailModalProps) {
  const router = useRouter()
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  const assignee = members.find((m) => m.id === task.assigned_to)

  useEffect(() => {
    getTaskComments(task.id)
      .then((data) => setComments(data as CommentWithProfile[]))
      .catch(() => toast.error('Erreur chargement commentaires'))
  }, [task.id])

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setLoading(true)
    try {
      await addTaskComment(task.id, newComment.trim())
      setNewComment('')
      const updated = await getTaskComments(task.id)
      setComments(updated as CommentWithProfile[])
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {assignee && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <User size={12} />
                  {assignee.full_name}
                </Badge>
              )}
              {task.due_date && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(task.due_date + 'T12:00:00').toLocaleDateString('fr-FR')}
                </Badge>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <h4 className="text-sm font-semibold mb-1.5">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Comments */}
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Historique ({comments.length})
              </h4>

              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Aucun commentaire. Soyez le premier !
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="bg-muted/40 rounded-lg p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {c.profiles?.full_name || 'Inconnu'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <div className="mt-3 flex gap-2">
                <Textarea
                  placeholder="Ajouter un commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleAddComment()
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="shrink-0"
                  onClick={handleAddComment}
                  disabled={loading || !newComment.trim()}
                >
                  <Send size={16} />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Ctrl+Entrée pour envoyer
              </p>
            </div>
        </div>

        <div className="flex justify-end pt-2 border-t mt-2">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
