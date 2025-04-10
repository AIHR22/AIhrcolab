# Supabase Setup Guide for Revenue Forecast Module

## Required Tables

### 1. ML Models Table
This table stores trained models and their metadata.

```sql
-- Create the ml_models table
create table ml_models (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid not null references projects(id),
  model_weights bytea not null,
  model_topology jsonb not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for faster queries
create index ml_models_project_id_idx on ml_models(project_id);
create index ml_models_created_at_idx on ml_models(created_at);
```

### 2. ML Features Table
Stores preprocessed features for each project.

```sql
-- Create the ml_features table
create table ml_features (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid not null references projects(id),
  features jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Index for faster queries
create index ml_features_project_id_idx on ml_features(project_id);
```

### 3. ML Metrics Table
Stores training and inference metrics.

```sql
-- Create the ml_metrics table
create table ml_metrics (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid not null references projects(id),
  metric_type text not null check (metric_type in ('training', 'inference')),
  metrics jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexes for faster queries
create index ml_metrics_project_id_idx on ml_metrics(project_id);
create index ml_metrics_type_idx on ml_metrics(metric_type);
```

## Row Level Security (RLS) Policies

### 1. ML Models Access

```sql
-- Enable RLS
alter table ml_models enable row level security;

-- Read policy
create policy "Users can read models for their projects"
on ml_models for select
using (
  project_id in (
    select project_id from project_members
    where user_id = auth.uid()
  )
);

-- Write policy
create policy "Users can create models for their projects"
on ml_models for insert
with check (
  project_id in (
    select project_id from project_members
    where user_id = auth.uid()
    and role in ('admin', 'data_scientist')
  )
);
```

### 2. ML Features Access

```sql
-- Enable RLS
alter table ml_features enable row level security;

-- Read policy
create policy "Users can read features for their projects"
on ml_features for select
using (
  project_id in (
    select project_id from project_members
    where user_id = auth.uid()
  )
);

-- Write policy
create policy "Users can create features for their projects"
on ml_features for insert
with check (
  project_id in (
    select project_id from project_members
    where user_id = auth.uid()
    and role in ('admin', 'data_scientist')
  )
);
```

### 3. ML Metrics Access

```sql
-- Enable RLS
alter table ml_metrics enable row level security;

-- Read policy
create policy "Users can read metrics for their projects"
on ml_metrics for select
using (
  project_id in (
    select project_id from project_members
    where user_id = auth.uid()
  )
);

-- Write policy
create policy "Users can create metrics for their projects"
on ml_metrics for insert
with check (
  project_id in (
    select project_id from project_members
    where user_id = auth.uid()
    and role in ('admin', 'data_scientist')
  )
);
```

## Setup Steps

1. **Create Tables**:
   - Execute the table creation SQL in order
   - Verify tables are created using Supabase dashboard

2. **Enable RLS**:
   - Enable RLS on all tables
   - Add policies in order
   - Test policies with different user roles

3. **Environment Variables**:
   Add these to your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Storage Buckets** (Optional):
   If you want to store large models:
   - Create a `ml-models` bucket
   - Set up appropriate bucket policies
   - Update ModelRegistry to use storage for large models

## Testing Your Setup

1. **Test Table Creation**:
```sql
-- Verify tables exist
select * from information_schema.tables 
where table_schema = 'public' 
and table_name like 'ml_%';
```

2. **Test RLS Policies**:
```sql
-- Test as different users
set local role authenticated;
set local role anon;
select * from ml_models where project_id = 'your_project_id';
```

3. **Test Permissions Matrix**:
```sql
-- Create test users and roles
insert into project_members (project_id, user_id, role)
values 
  ('test_project', 'test_admin', 'admin'),
  ('test_project', 'test_viewer', 'viewer');

-- Test access
set local role authenticated;
set session "request.jwt.claims" = '{"sub": "test_admin"}';
-- Try operations...
```

## Common Issues & Solutions

1. **Large Model Storage**:
   - For models > 1MB, use Supabase Storage
   - Split model artifacts into chunks
   - Store metadata separately

2. **Performance**:
   - Use appropriate indexes
   - Implement caching for frequently accessed models
   - Consider partitioning for large datasets

3. **Security**:
   - Always validate project_id
   - Use service role key for admin operations
   - Implement rate limiting

## Next Steps

1. Implement backup strategy
2. Set up monitoring
3. Add model versioning
4. Implement feature store
5. Add model evaluation metrics