'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

export function MemberForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [roleLabel, setRoleLabel] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const password = Math.random().toString(36).slice(-10) + 'A1!'
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        email,
        role_label: roleLabel || undefined,
        password,
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Membre ajouté avec succès')
      setOpen(false)
      setFullName('')
      setEmail('')
      setRoleLabel('')
      onCreated()
    } else {
      const { error } = await res.json()
      toast.error(error || "Impossible d'ajouter le membre")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <Plus size={16} className="mr-1" /> Ajouter un membre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un membre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="fullName">Nom complet *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="roleLabel">Rôle / Fonction</Label>
            <Input
              id="roleLabel"
              value={roleLabel}
              onChange={(e) => setRoleLabel(e.target.value)}
              placeholder="Ex: Développeur, Chef de projet..."
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Un mot de passe temporaire sera généré. Le membre pourra le
            réinitialiser.
          </p>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
