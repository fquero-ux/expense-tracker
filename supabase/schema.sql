-- Create Enum for Categories
CREATE TYPE expense_category AS ENUM (
  'Comida',
  'Transporte',
  'Oficina',
  'Software',
  'Servicios',
  'Otros'
);

-- Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() NOT NULL, -- Defaults to current user if not provided
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  category expense_category NOT NULL,
  proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Row Level Security)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Note: user_id reference to auth.users is implicit in Supabase widely, 
-- but explicit FK requires permissions on auth schema which might fail in some editors 
-- if run by non-superuser. Standard practice is to trust auth.uid().
-- However, for strict FK: 
-- user_id UUID REFERENCES auth.users(id) NOT NULL

-- Policy: Users can only see their own expenses
CREATE POLICY "Users can view own expenses" 
ON public.expenses 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own expenses
CREATE POLICY "Users can insert own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own expenses
CREATE POLICY "Users can update own expenses" 
ON public.expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own expenses
CREATE POLICY "Users can delete own expenses" 
ON public.expenses 
FOR DELETE 
USING (auth.uid() = user_id);
