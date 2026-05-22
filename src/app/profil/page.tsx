'use client'

import { DefaultDaysForm } from '@/components/profile/DefaultDaysForm'

export default function ProfilPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <DefaultDaysForm />
    </div>
  )
}
