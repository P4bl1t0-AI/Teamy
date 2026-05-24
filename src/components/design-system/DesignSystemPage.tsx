'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PRESENCE_COLORS, PRESENCE_LABELS, PRESENCE_OPTIONS } from '@/lib/constants'
import {
  Palette,
  Type,
  Layout,
  Component,
  Moon,
  Sun,
  Check,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-react'

// ─── Sections ───

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-primary" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <Separator />
      {children}
    </section>
  )
}

function ColorSwatch({ name, value, cssVar }: { name: string; value: string; cssVar: string }) {
  return (
    <div className="space-y-1.5">
      <div
        className="h-16 w-full rounded-lg border shadow-sm"
        style={{ background: value }}
      />
      <div className="text-xs font-medium">{name}</div>
      <div className="text-[10px] text-muted-foreground font-mono">{cssVar}</div>
    </div>
  )
}

// ─── Main Page ───

export function DesignSystemPage() {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
          <p className="text-muted-foreground mt-1">
            Tokens, composants et patterns utilisés dans Teamy
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          {isDark ? 'Mode clair' : 'Mode sombre'}
        </Button>
      </div>

      {/* ─── COLORS ─── */}
      <Section title="Couleurs" icon={Palette}>
        <div className="space-y-6">
          {/* Primary */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Primaires</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              <ColorSwatch name="Primary" value="oklch(0.205 0 0)" cssVar="--primary" />
              <ColorSwatch name="Primary FG" value="oklch(0.985 0 0)" cssVar="--primary-foreground" />
              <ColorSwatch name="Secondary" value="oklch(0.97 0 0)" cssVar="--secondary" />
              <ColorSwatch name="Secondary FG" value="oklch(0.205 0 0)" cssVar="--secondary-foreground" />
              <ColorSwatch name="Accent" value="oklch(0.97 0 0)" cssVar="--accent" />
              <ColorSwatch name="Accent FG" value="oklch(0.205 0 0)" cssVar="--accent-foreground" />
            </div>
          </div>

          {/* Neutrals */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Neutres</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              <ColorSwatch name="Background" value="oklch(1 0 0)" cssVar="--background" />
              <ColorSwatch name="Foreground" value="oklch(0.145 0 0)" cssVar="--foreground" />
              <ColorSwatch name="Card" value="oklch(1 0 0)" cssVar="--card" />
              <ColorSwatch name="Card FG" value="oklch(0.145 0 0)" cssVar="--card-foreground" />
              <ColorSwatch name="Muted" value="oklch(0.97 0 0)" cssVar="--muted" />
              <ColorSwatch name="Muted FG" value="oklch(0.556 0 0)" cssVar="--muted-foreground" />
            </div>
          </div>

          {/* Semantic */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Sémantiques</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorSwatch name="Destructive" value="oklch(0.577 0.245 27.325)" cssVar="--destructive" />
              <ColorSwatch name="Border" value="oklch(0.922 0 0)" cssVar="--border" />
              <ColorSwatch name="Input" value="oklch(0.922 0 0)" cssVar="--input" />
              <ColorSwatch name="Ring" value="oklch(0.708 0 0)" cssVar="--ring" />
            </div>
          </div>

          {/* Presence (Teamy specific) */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Présence (Teamy)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {PRESENCE_OPTIONS.map((opt) => {
                const colors = PRESENCE_COLORS[opt.value].split(' ')
                const bg = colors.find((c) => c.startsWith('bg-'))?.replace('bg-', '') || 'gray-100'
                return (
                  <div key={opt.value} className="space-y-1.5">
                    <div className={`h-16 w-full rounded-lg border shadow-sm ${PRESENCE_COLORS[opt.value].split(' ')[0]}`} />
                    <div className="text-xs font-medium">{opt.label}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{opt.value}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── TYPOGRAPHY ─── */}
      <Section title="Typographie" icon={Type}>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="text-4xl font-bold">Heading 1 — 36px bold</div>
            <div className="text-3xl font-semibold">Heading 2 — 30px semibold</div>
            <div className="text-2xl font-semibold">Heading 3 — 24px semibold</div>
            <div className="text-xl font-medium">Heading 4 — 20px medium</div>
            <div className="text-lg font-medium">Heading 5 — 18px medium</div>
            <div className="text-base">Body — 16px regular</div>
            <div className="text-sm text-muted-foreground">Small — 14px muted</div>
            <div className="text-xs text-muted-foreground">Caption — 12px muted</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Font Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Sans:</span> Geist Sans / system-ui</div>
                <div><span className="text-muted-foreground">Mono:</span> Geist Mono</div>
                <div><span className="text-muted-foreground">Heading:</span> Geist Sans</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Line Heights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Tight:</span> 1.25 (headings)</div>
                <div><span className="text-muted-foreground">Normal:</span> 1.5 (body)</div>
                <div><span className="text-muted-foreground">Relaxed:</span> 1.625 (large text)</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* ─── SPACING ─── */}
      <Section title="Spacing & Radius" icon={Layout}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div
                  className="bg-primary/20 border border-primary/30"
                  style={{ width: s * 4, height: s * 4 }}
                />
                <span className="text-[10px] text-muted-foreground">{s * 4}px</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['sm', 'md', 'lg', 'xl'].map((r) => (
              <div key={r} className="space-y-1.5">
                <div className={`h-16 bg-muted border border-border radius-${r}`} style={{ borderRadius: r === 'sm' ? 'calc(var(--radius) * 0.6)' : r === 'md' ? 'calc(var(--radius) * 0.8)' : r === 'lg' ? 'var(--radius)' : 'calc(var(--radius) * 1.4)' }} />
                <div className="text-xs font-medium capitalize">{r}</div>
                <div className="text-[10px] text-muted-foreground font-mono">radius-{r}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── COMPONENTS ─── */}
      <Section title="Composants" icon={Component}>
        <div className="space-y-8">
          {/* Buttons */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Boutons</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" variant="outline">
                <Check size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>
                Disabled Outline
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Badges</h3>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {PRESENCE_OPTIONS.map((opt) => (
                <Badge
                  key={opt.value}
                  variant="outline"
                  className={PRESENCE_COLORS[opt.value]}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cartes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Description de la carte</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Contenu de la carte avec du texte.</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardHeader className="bg-primary/5">
                  <CardTitle>Card Accent</CardTitle>
                  <CardDescription>Avec un header coloré</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Variante avec accent visuel.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Card Interactive</CardTitle>
                  <CardDescription>Hover pour shadow</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Carte avec effet au survol.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Elements */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Formulaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-2">
                <Label htmlFor="demo-input">Input</Label>
                <Input id="demo-input" placeholder="Placeholder..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-select">Select</Label>
                <Select>
                  <SelectTrigger id="demo-select">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">Option A</SelectItem>
                    <SelectItem value="b">Option B</SelectItem>
                    <SelectItem value="c">Option C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-textarea">Textarea</Label>
                <Textarea id="demo-textarea" placeholder="Texte long..." rows={3} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="demo-check" />
                  <Label htmlFor="demo-check" className="font-normal">Checkbox</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="demo-switch" />
                  <Label htmlFor="demo-switch" className="font-normal">Switch</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Avatars */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avatars</h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">AB</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">CD</AvatarFallback>
              </Avatar>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-sm">EF</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-base">GH</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Dialog */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dialog</h3>
            <Dialog>
              <DialogTrigger>
                <Button variant="outline">Ouvrir Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Titre du Dialog</DialogTitle>
                  <DialogDescription>
                    Description du dialog avec des explications.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input placeholder="Votre nom" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Annuler</Button>
                  <Button>Confirmer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tableau</h3>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Alice Martin</TableCell>
                    <TableCell>Développeuse</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={PRESENCE_COLORS.office}>
                        Sur site
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Éditer</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bob Dupont</TableCell>
                    <TableCell>Designer</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={PRESENCE_COLORS.remote}>
                        Télétravail
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Éditer</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Carole Petit</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={PRESENCE_COLORS.leave}>
                        Absence
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Éditer</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── ALERTS & FEEDBACK ─── */}
      <Section title="Alertes & Feedback" icon={AlertCircle}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="flex items-start gap-3 pt-6">
                <Check className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-emerald-900">Succès</div>
                  <div className="text-sm text-emerald-700">L&apos;opération a réussi.</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="flex items-start gap-3 pt-6">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-blue-900">Info</div>
                  <div className="text-sm text-blue-700">Information importante.</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-amber-900">Attention</div>
                  <div className="text-sm text-amber-700">Vérifiez avant de continuer.</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="flex items-start gap-3 pt-6">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-red-900">Erreur</div>
                  <div className="text-sm text-red-700">Une erreur s&apos;est produite.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* ─── TOKENS REFERENCE ─── */}
      <Section title="Référence Tokens CSS" icon={Layout}>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Valeur (light)</TableHead>
                <TableHead>Usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { token: '--background', value: 'oklch(1 0 0)', usage: 'Fond de page' },
                { token: '--foreground', value: 'oklch(0.145 0 0)', usage: 'Texte principal' },
                { token: '--primary', value: 'oklch(0.205 0 0)', usage: 'Boutons, liens actifs' },
                { token: '--primary-foreground', value: 'oklch(0.985 0 0)', usage: 'Texte sur primary' },
                { token: '--secondary', value: 'oklch(0.97 0 0)', usage: 'Boutons secondaires' },
                { token: '--muted', value: 'oklch(0.97 0 0)', usage: 'Fonds alternatifs' },
                { token: '--muted-foreground', value: 'oklch(0.556 0 0)', usage: 'Texte secondaire' },
                { token: '--border', value: 'oklch(0.922 0 0)', usage: 'Bordures' },
                { token: '--input', value: 'oklch(0.922 0 0)', usage: 'Champs de formulaire' },
                { token: '--ring', value: 'oklch(0.708 0 0)', usage: 'Focus states' },
                { token: '--radius', value: '0.625rem', usage: 'Rayon de bordure' },
                { token: '--destructive', value: 'oklch(0.577 0.245 27.325)', usage: 'Erreurs, suppression' },
              ].map((row) => (
                <TableRow key={row.token}>
                  <TableCell className="font-mono text-xs">{row.token}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.value}</TableCell>
                  <TableCell className="text-sm">{row.usage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {/* Footer */}
      <div className="pt-8 pb-4 text-center text-sm text-muted-foreground">
        Teamy Design System — mis à jour le {new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  )
}
