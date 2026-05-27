'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/constants'
import type { Task, TaskStatus, TaskPriority, Profile } from '@/types'
import { getTaskComments, addTaskComment } from '@/app/actions'
import { toast } from 'sonner'
import { Send, Trash2, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TaskDetailModalProps {
  task: Task
  members: Profile[]
  onClose: () => void
  onSubmit: (data: {
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    assigned_to: string | null
    due_date: string | null
  }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

type CommentWithProfile = {
  id: string
  content: string
  created_at: string
  profiles: { id: string; full_name: string } | null
}

export function TaskDetailModal({
  task,
  members,
  onClose,
  onSubmit,
  onDelete,
}: TaskDetailModalProps) {
  const router = useRouter()

  // ─── Form state ───
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [assignedTo, setAssignedTo] = useState(task.assigned_to ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [saving, setSaving] = useState(false)

  // ─── Comments state ───
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  const assignee = members.find((m) => m.id === task.assigned_to)

  useEffect(() => {
    getTaskComments(task.id)
      .then((data) => setComments(data as CommentWithProfile[]))
      .catch(() => toast.error('Erreur chargement commentaires'))
  }, [task.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        title,
        description: description || null,
        status,
        priority,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
      })
      router.refresh()
      toast.success('Tâche enregistrée')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('Supprimer cette tâche ?')) return
    try {
      await onDelete(task.id)
      onClose()
      toast.success('Tâche supprimée')
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setCommentLoading(true)
    try {
      await addTaskComment(task.id, newComment.trim())
      setNewComment('')
      const updated = await getTaskComments(task.id)
      setComments(updated as CommentWithProfile[])
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'Erreur')
    } finally {
      setCommentLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{task.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ─── Badges actuels (lecture seule) ─── */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
            {assignee && (
              <span className="text-xs text-muted-foreground">
                Assigné à : {assignee.full_name}
              </span>
            )}
          </div>

          {/* ─── Formulaire d'édition ─── */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priorité *</Label>
                <Select value={priority} onValueChange={(v) => v && setPriority(v as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut *</Label>
                <Select value={status} onValueChange={(v) => v && setStatus(v as TaskStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Assigné à</Label>
                <Select
                  value={assignedTo}
                  onValueChange={(v) => setAssignedTo(v || '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Non assigné" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Non assigné</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Date d&apos;échéance</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ─── Boutons d'action formulaire ─── */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex gap-2">
              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} className="mr-1" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                <X size={14} className="mr-1" />
                Fermer
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                <Save size={14} className="mr-1" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </form>

        {/* ─── Séparateur ─── */}
        <div className="border-t my-4" />

        {/* ─── Commentaires ─── */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
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
          <div className="flex gap-2">
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
              disabled={commentLoading || !newComment.trim()}
            >
              <Send size={16} />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Ctrl+Entrée pour envoyer
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
