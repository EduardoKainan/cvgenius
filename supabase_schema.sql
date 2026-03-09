-- 1. Create a table to store user profiles and credits
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  credits integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS) so users can only access their own data
alter table public.profiles enable row level security;

-- 3. Create policies for the profiles table
-- Allow users to view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Allow users to update their own profile (e.g., deducting credits)
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 4. Create a function to handle new user signups
-- This function automatically creates a profile row when a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 0); -- Start with 0 credits
  return new;
end;
$$;

-- 5. Create a trigger to call the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Create a table to store generated resumes (Optional, but recommended)
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Meu Currículo',
  data jsonb not null default '{}'::jsonb, -- Stores the JSON structure of the resume
  template text not null default 'modern',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Enable RLS for resumes
alter table public.resumes enable row level security;

-- 8. Create policies for the resumes table
-- Allow users to view their own resumes
create policy "Users can view own resumes"
  on public.resumes for select
  using ( auth.uid() = user_id );

-- Allow users to insert their own resumes
create policy "Users can insert own resumes"
  on public.resumes for insert
  with check ( auth.uid() = user_id );

-- Allow users to update their own resumes
create policy "Users can update own resumes"
  on public.resumes for update
  using ( auth.uid() = user_id );

-- Allow users to delete their own resumes
create policy "Users can delete own resumes"
  on public.resumes for delete
  using ( auth.uid() = user_id );

-- 9. (Optional) Create a function to automatically update the 'updated_at' column
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 10. (Optional) Apply the updated_at trigger to tables
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_resumes_updated_at
  before update on public.resumes
  for each row execute procedure public.handle_updated_at();
