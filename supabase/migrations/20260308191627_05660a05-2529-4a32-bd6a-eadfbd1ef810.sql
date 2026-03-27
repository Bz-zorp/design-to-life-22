
-- Hospital beds inventory
CREATE TABLE public.hospital_beds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_name TEXT NOT NULL,
  city TEXT NOT NULL,
  ward_type TEXT NOT NULL, -- General, ICU, Private, Semi-Private
  total_beds INTEGER NOT NULL DEFAULT 0,
  occupied_beds INTEGER NOT NULL DEFAULT 0,
  price_per_day INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bed reservations by users
CREATE TABLE public.bed_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hospital_bed_id UUID REFERENCES public.hospital_beds(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, cancelled, completed
  booking_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospital_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bed_reservations ENABLE ROW LEVEL SECURITY;

-- Hospital beds: readable by all authenticated users
CREATE POLICY "Anyone can view hospital beds"
  ON public.hospital_beds FOR SELECT
  TO authenticated
  USING (true);

-- Bed reservations: users can only manage their own
CREATE POLICY "Users can view own reservations"
  ON public.bed_reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reservations"
  ON public.bed_reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON public.bed_reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
