-- Supabase Schema for NUNNARI AI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CONVERSATIONS
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'New Chat',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  archived boolean default false,
  pinned boolean default false
);
alter table public.conversations enable row level security;
create policy "Users can manage own conversations" on public.conversations for all using (auth.uid() = user_id);
create index idx_conversations_user_id on public.conversations(user_id);

-- MESSAGES
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.messages enable row level security;
create policy "Users can manage messages in own conversations" on public.messages for all using (
  exists (select 1 from public.conversations where id = public.messages.conversation_id and user_id = auth.uid())
);
create index idx_messages_conversation_id on public.messages(conversation_id);

-- ATTACHMENTS
create table public.attachments (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  file_type text not null,
  file_size bigint,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.attachments enable row level security;
create policy "Users can manage own attachments" on public.attachments for all using (auth.uid() = user_id);
create index idx_attachments_conversation_id on public.attachments(conversation_id);

-- USER PREFERENCES
create table public.user_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  theme text default 'system',
  response_style text default 'balanced',
  custom_instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.user_preferences enable row level security;
create policy "Users can manage own preferences" on public.user_preferences for all using (auth.uid() = user_id);

-- STORAGE (requires manual bucket creation 'attachments' if using SQL, or just through dashboard)
-- We add policies for 'attachments' bucket
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false) on conflict do nothing;

create policy "Users can upload attachments" on storage.objects for insert with check (bucket_id = 'attachments' and auth.uid() = owner);
create policy "Users can read own attachments" on storage.objects for select using (bucket_id = 'attachments' and auth.uid() = owner);
create policy "Users can delete own attachments" on storage.objects for delete using (bucket_id = 'attachments' and auth.uid() = owner);
