
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: admins can view all roles, users can view own
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- RLS: only admins can insert roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: only admins can update roles
CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS: only admins can delete roles
CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create doctors table
CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  experience text NOT NULL,
  rating numeric(2,1) DEFAULT 4.0,
  reviews text DEFAULT '0',
  hospital text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  fee text NOT NULL,
  img text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active doctors
CREATE POLICY "Anyone can view doctors" ON public.doctors
FOR SELECT TO authenticated
USING (true);

-- Admins can insert doctors
CREATE POLICY "Admins can insert doctors" ON public.doctors
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update doctors
CREATE POLICY "Admins can update doctors" ON public.doctors
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete doctors
CREATE POLICY "Admins can delete doctors" ON public.doctors
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert/update/delete hospital_beds
CREATE POLICY "Admins can insert hospital beds" ON public.hospital_beds
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hospital beds" ON public.hospital_beds
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hospital beds" ON public.hospital_beds
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all reservations
CREATE POLICY "Admins can view all reservations" ON public.bed_reservations
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- Allow admins to update any reservation
CREATE POLICY "Admins can update all reservations" ON public.bed_reservations
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = id);

-- Allow admins to view all medical history
CREATE POLICY "Admins can view all medical history" ON public.medical_history
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
