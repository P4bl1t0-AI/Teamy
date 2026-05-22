-- Enums pour le calendrier
CREATE TYPE public.calendar_entry_type AS ENUM ('vacation', 'remote', 'office', 'sick_leave');
CREATE TYPE public.company_holiday_type AS ENUM ('public_holiday', 'company_day');

-- Table des jours fériés et congés collectifs
CREATE TABLE public.company_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  type public.company_holiday_type NOT NULL DEFAULT 'public_holiday',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Table des entrées calendrier par membre
CREATE TABLE public.calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type public.calendar_entry_type NOT NULL,
  notes TEXT CHECK (char_length(notes) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, date)
);

-- Index pour les performances
CREATE INDEX idx_calendar_entries_profile_date ON public.calendar_entries(profile_id, date);
CREATE INDEX idx_calendar_entries_date ON public.calendar_entries(date);
CREATE INDEX idx_company_holidays_date ON public.company_holidays(date);

-- Ajout des colonnes de défaut sur profiles
ALTER TABLE public.profiles 
  ADD COLUMN default_monday TEXT CHECK (default_monday IN ('remote', 'office')),
  ADD COLUMN default_tuesday TEXT CHECK (default_tuesday IN ('remote', 'office')),
  ADD COLUMN default_wednesday TEXT CHECK (default_wednesday IN ('remote', 'office')),
  ADD COLUMN default_thursday TEXT CHECK (default_thursday IN ('remote', 'office')),
  ADD COLUMN default_friday TEXT CHECK (default_friday IN ('remote', 'office'));

-- Trigger updated_at pour calendar_entries
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_calendar_entries_updated
  BEFORE UPDATE ON public.calendar_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS : company_holidays
ALTER TABLE public.company_holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_holidays_select" ON public.company_holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "company_holidays_insert" ON public.company_holidays FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "company_holidays_update" ON public.company_holidays FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "company_holidays_delete" ON public.company_holidays FOR DELETE TO authenticated USING (true);

-- RLS : calendar_entries
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_entries_select" ON public.calendar_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "calendar_entries_insert" ON public.calendar_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "calendar_entries_update" ON public.calendar_entries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "calendar_entries_delete" ON public.calendar_entries FOR DELETE TO authenticated USING (true);
