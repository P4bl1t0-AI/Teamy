'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from '@/lib/constants'
import type { Task, TaskStatus, TaskPriority, Profile } from '@/types/database'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { TaskForm } from './TaskForm'
import { createTask, updateTask, deleteTask } from '@/app/actions'
import { toast } from 'sonner'

interface TaskBoardProps {
  tasks: Task[]
  members: Profile[]
  currentProfileId: string
}

export function TaskBoard({ tasks, members, currentProfileId }: TaskBoardProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>('all')
  const [priorityFilter, setPriorityFilter] = useState<string | null>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const membersMap = useMemo(() => {
    const map = new Map<string, string>()
    members.forEach((m) => map.set(m.id, m.full_name))
    return map
  }, [members])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description?.toLowerCase() || '').includes(search.toLowerCase())
      const matchesStatus = !statusFilter || statusFilter === 'all' || t.status === statusFilter
      const matchesPriority = !priorityFilter || priorityFilter === 'all' || t.priority === priorityFilter
      const matchesAssignee =
        !assigneeFilter || assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' ? !t.assigned_to : t.assigned_to === assigneeFilter)
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter])

  const handleCreate = async (data: {
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    assigned_to: string | null
    due_date: string | null
  }) => {
    try {
      await createTask(data)
      toast.success('Tâche créée')
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la création')
    }
  }

  const handleUpdate = async (data: {
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    assigned_to: string | null
    due_date: string | null
  }) => {
    if (!editTask) return
    try {
      await updateTask(editTask.id, data)
      setEditTask(null)
      toast.success('Tâche mise à jour')
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette tâche ?')) return
    try {
      await deleteTask(id)
      toast.success('Tâche supprimée')
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-48"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes priorités</SelectItem>
              {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Assigné à" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="unassigned">Non assigné</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus size={16} className="mr-1" /> Nouvelle tâche
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Assigné à</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucune tâche trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    {task.assigned_to
                      ? membersMap.get(task.assigned_to) || 'Inconnu'
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString('fr-FR')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditTask(task)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TaskForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        members={members.map((m) => ({ id: m.id, full_name: m.full_name }))}
        mode="create"
      />

      {editTask && (
        <TaskForm
          open={!!editTask}
          onOpenChange={() => setEditTask(null)}
          onSubmit={handleUpdate}
          initial={{
            title: editTask.title,
            description: editTask.description,
            status: editTask.status,
            priority: editTask.priority,
            assigned_to: editTask.assigned_to,
            due_date: editTask.due_date,
          }}
          members={members.map((m) => ({ id: m.id, full_name: m.full_name }))}
          mode="edit"
        />
      )}
    </div>
  )
}
