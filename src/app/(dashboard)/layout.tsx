import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import { AuthProvider } from '@/components/layout/AuthProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "Teamy — Gestion d'équipe",
  description: 'App de gestion de tâches et membres',
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-background">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-6 py-6">
              {children}
            </div>
          </main>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
