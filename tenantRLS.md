# Row Level Security (RLS) Policies

## RLS Policies on `platform_admins`

### 1. `platform_admins_select` (SELECT)
```sql
CREATE POLICY "platform_admins_select"
ON platform_admins
FOR SELECT
USING (
    -- Allow authenticated users to check if they are platform admins
    -- This prevents infinite recursion while maintaining security
    auth.uid() IS NOT NULL
);
```

### 2. `platform_admins_insert` (INSERT)
```sql
CREATE POLICY "platform_admins_insert"
ON platform_admins
FOR INSERT
WITH CHECK (
    -- Only super admin can insert new platform admins
    auth.uid() IN (SELECT user_id FROM platform_admins WHERE user_id = auth.uid())
);
```

### 3. `platform_admins_delete` (DELETE)
```sql
CREATE POLICY "platform_admins_delete"
ON platform_admins
FOR DELETE
USING (
    -- Only super admin can delete platform admins
    auth.uid() IN (SELECT user_id FROM platform_admins WHERE user_id = auth.uid())
);
```

## RLS Policies on `tenants`

> **Note:** all policies are `PERMISSIVE` and target `PUBLIC` by default.

### 1. `delete_tenants` (DELETE)
```sql
CREATE POLICY "delete_tenants"
ON public.tenants
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
);
```

### 2. `insert_tenants` (SELECT)
```sql
CREATE POLICY "insert_tenants"
ON public.tenants
FOR SELECT
USING (
  -- Users can see tenants they belong to
  EXISTS (
    SELECT 1
    FROM tenant_users tu
    WHERE tu.user_id = auth.uid()
      AND tu.tenant_id = tenants.id
  )
  OR
  -- Platform admins can see all
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
);
```

### 3. `update_tenants` (UPDATE)
```sql
CREATE POLICY "update_tenants"
ON public.tenants
FOR UPDATE
USING (
  -- Only platform admins can update tenants
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
);
```

## RLS Policies for `tenant_users`

> All policies are **PERMISSIVE** and apply to **PUBLIC** by default.

### 1. `tenant_users_select` (SELECT)
```sql
CREATE POLICY "tenant_users_select"
ON public.tenant_users
FOR SELECT
USING (
  -- Users can see their own records
  user_id = auth.uid()
  OR
  -- Platform admins can see all records
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
  OR
  -- Client admins can see users in their tenant
  EXISTS (
    SELECT 1
    FROM tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
);
```

### 2. `tenant_users_insert` (INSERT)
```sql
CREATE POLICY "tenant_users_insert"
ON public.tenant_users
FOR INSERT
WITH CHECK (
  -- Platform admins can insert any tenant user
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
  OR
  -- Client admins can add users to their tenant
  EXISTS (
    SELECT 1
    FROM tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
);
```

### 3. `tenant_users_update` (UPDATE)
```sql
CREATE POLICY "tenant_users_update"
ON public.tenant_users
FOR UPDATE
USING (
  -- Users can update their own records
  user_id = auth.uid()
  OR
  -- Platform admins can update all records
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
  OR
  -- Client admins can update users in their tenant
  EXISTS (
    SELECT 1
    FROM tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
);
```

### 4. `tenant_users_delete` (DELETE)
```sql
CREATE POLICY "tenant_users_delete"
ON public.tenant_users
FOR DELETE
USING (
  -- Users can delete their own records
  user_id = auth.uid()
  OR
  -- Platform admins can delete any record
  EXISTS (
    SELECT 1
    FROM platform_admins
    WHERE user_id = auth.uid()
  )
  OR
  -- Client admins can delete users from their tenant
  EXISTS (
    SELECT 1
    FROM tenant_users tu
    WHERE tu.user_id = auth.uid()
    AND tu.tenant_id = tenant_users.tenant_id
    AND tu.role = 'client_admin'
  )
);
```