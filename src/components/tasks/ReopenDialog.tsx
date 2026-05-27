'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Task } from '@/types'
import { RotateCcw, AlertTriangle } from 'lucide-react'

interface ReopenDialogProps {
  task: Task
  onConfirm: (comment: string) => void
  onCancel: () => void
}

export function ReopenDialog({ task, onConfirm, onCancel }: ReopenDialogProps) {
  const [comment, setComment] = useState('')

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw size={18} />
            Réouvrir la tâche
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Tâche : {task.title}</p>
              <p className="text-xs mt-0.5 opacity-80">
                Cette tâche était marquée comme "Terminée". Pour la réouvrir,
                merci d&apos;indiquer ce qu&apos;il reste à faire.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Commentaire obligatoire</label>
            <Textarea
              placeholder="Décrivez ce qu'il reste à faire..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button
              onClick={() => onConfirm(comment)}
              disabled={!comment.trim()}
              className="gap-1"
            >
              <RotateCcw size={14} />
              Réouvrir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
