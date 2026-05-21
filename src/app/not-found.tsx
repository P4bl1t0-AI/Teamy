'use client'

import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-slate-200">404</h1>
      <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Button className="mt-6" onClick={() => window.location.href = '/'}>
        <Home size={16} className="mr-2" />
        Retour à l&apos;accueil
      </Button>
    </div>
  )
}
