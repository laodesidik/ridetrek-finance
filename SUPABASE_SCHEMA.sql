-- Create the transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  amount numeric not null,
  description text not null,
  category text not null check (category in ('Hotel', 'Makan', 'Tiket Wisata', 'Ferry')),
  date date not null,
  paid_by text not null,
  split_type text not null check (split_type in ('equal', 'unequal', 'specific')),
  splits jsonb not null,
  payment_status jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index idx_transactions_date on transactions(date);
create index idx_transactions_paid_by on transactions(paid_by);
create index idx_transactions_category on transactions(category);

-- Set up Row Level Security (RLS)
-- Enable RLS for the transactions table
alter table transactions enable row level security;

-- Create policy for admin full access
create policy "admin full access" on transactions
  for all
  using (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

-- Create policy to allow admins to read all transactions
create policy "admin can read all transactions" on transactions
  for select
  using (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

-- Create policy to allow admins to insert transactions
create policy "admin can insert transactions" on transactions
  for insert
  with check (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

-- Create policy to allow admins to update transactions
create policy "admin can update transactions" on transactions
  for update
  using (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

-- Create policy to allow admins to delete transactions
create policy "admin can delete transactions" on transactions
  for delete
  using (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin');

-- RLS is now enabled with admin-only access policies
-- Only users with role 'admin' in their user_metadata can access transactions

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
   NEW.updated_at = now(); 
   return NEW; 
end;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
create trigger update_transactions_updated_at before update
    on transactions for each row execute procedure 
    update_updated_at_column();
