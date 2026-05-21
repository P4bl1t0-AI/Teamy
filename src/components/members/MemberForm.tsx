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
  const [createdPassword, setCreatedPassword] = useState<string | null>(null)

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
      setCreatedPassword(password)
      toast.success('Membre ajouté avec succès')
      onCreated()
    } else {
      const { error } = await res.json()
      toast.error(error || "Impossible d'ajouter le membre")
    }
  }

  const handleClose = () => {
    setOpen(false)
    setCreatedPassword(null)
    setFullName('')
    setEmail('')
    setRoleLabel('')
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
          <DialogTitle>
            {createdPassword ? 'Membre créé !' : 'Ajouter un membre'}
          </DialogTitle>
        </DialogHeader>
        {createdPassword ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Le compte a été créé. Voici le mot de passe temporaire à transmettre :
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={createdPassword}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(createdPassword)
                  toast.success('Mot de passe copié')
                }}
              >
                Copier
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Le nouveau membre pourra se connecter avec son email et ce mot de passe, puis le modifier dans ses paramètres.
            </p>
            <Button className="w-full" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  )
}
