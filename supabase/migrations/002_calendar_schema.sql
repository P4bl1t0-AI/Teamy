-- Enum pour les types de presence
CREATE TYPE public.presence_type AS ENUM ('office', 'remote', 'leave', 'holiday');

-- Table calendar_entries : une entree par personne et par jour
CREATE TABLE public.calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  presence public.presence_type NOT NULL DEFAULT 'office',
  note TEXT CHECK (char_length(note) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, date)
);

-- Index pour les requetes calendrier
CREATE INDEX idx_calendar_date ON public.calendar_entries(date);
CREATE INDEX idx_calendar_profile ON public.calendar_entries(profile_id);
CREATE INDEX idx_calendar_profile_date ON public.calendar_entries(profile_id, date);

-- Trigger updated_at (reutiliser la fonction existante)
CREATE TRIGGER on_calendar_entries_updated
  BEFORE UPDATE ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS calendar_entries
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_select" ON public.calendar_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "calendar_insert" ON public.calendar_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "calendar_update" ON public.calendar_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "calendar_delete" ON public.calendar_entries FOR DELETE TO authenticated USING (true);

-- Table team_holidays : jours feries et fermetures
CREATE TABLE public.team_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_team_holidays_date ON public.team_holidays(date);

-- RLS team_holidays
ALTER TABLE public.team_holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_holidays_select" ON public.team_holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_holidays_insert" ON public.team_holidays FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "team_holidays_update" ON public.team_holidays FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_holidays_delete" ON public.team_holidays FOR DELETE TO authenticated USING (true);

-- Ajouter default_days a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_days JSONB DEFAULT '{}';
