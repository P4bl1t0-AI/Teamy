export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
  cancelled: 'Annulé',
}

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
}

export const STATUS_OPTIONS = [
  { value: 'todo', label: 'À faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
]

export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' },
]

export const PRESENCE_LABELS: Record<string, string> = {
  office: 'Sur site',
  remote: 'Télétravail',
  leave: 'Absence',
  holiday: 'Férié',
}

export const PRESENCE_OPTIONS = [
  { value: 'office', label: 'Sur site' },
  { value: 'remote', label: 'Télétravail' },
  { value: 'leave', label: 'Absence' },
  { value: 'holiday', label: 'Férié' },
]

export const PRESENCE_COLORS: Record<string, string> = {
  office: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  remote: 'bg-blue-100 text-blue-800 border-blue-300',
  leave: 'bg-amber-100 text-amber-800 border-amber-300',
  holiday: 'bg-rose-100 text-rose-800 border-rose-300',
}

export const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
