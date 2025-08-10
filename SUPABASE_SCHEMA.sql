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
-- NOTE: For demo purposes, we're disabling RLS. In production, you should enable and configure it properly
-- alter table transactions enable row level security;

-- For demo purposes, we're allowing all operations without authentication
-- In a real application, you would implement proper authentication and authorization

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
