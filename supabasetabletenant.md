# Database Schema

## Tables

### 1. tenant_users

- **Columns**
  - `id` `UUID` NOT NULL DEFAULT `gen_random_uuid()`
  - `user_id` `UUID` NULL
  - `role` `TEXT` NOT NULL  
    - **Allowed values**: `'client_admin'`, `'sub_user'`
  - `created_at` `TIMESTAMPTZ` NULL DEFAULT `CURRENT_TIMESTAMP`
  - `updated_at` `TIMESTAMPTZ` NULL DEFAULT `CURRENT_TIMESTAMP`
  - `tenant_id` `UUID` NULL

- **Constraints & Triggers**
  - `PRIMARY KEY (id)`
  - `FOREIGN KEY (tenant_id)` → `tenants(id)`
  - `CHECK (role = ANY(ARRAY['client_admin','sub_user']))`
  - **Trigger**: `enforce_tenant_user_limit`
    ```sql
    BEFORE INSERT ON tenant_users
    EXECUTE FUNCTION check_tenant_user_limit();
    ```

- **RLS Policies**
  - Users can see and manage their own records
  - Platform admins have full access to all records
  - Client admins can manage users within their tenant
  - Enforces tenant isolation for regular users

---

### 2. user_profiles
- **Columns**
  - `id` `UUID` NOT NULL DEFAULT `gen_random_uuid()`
  - `email` `TEXT` NOT NULL
  - `name` `TEXT` NULL
  - `role` `TEXT` NULL DEFAULT `'user'`
    - (application‐level role; defaults to `user`)
  - `created_at` `TIMESTAMPTZ` NULL DEFAULT `now()`
  - `updated_at` `TIMESTAMPTZ` NULL DEFAULT `now()`
  - `user_id` `UUID` NULL  
    - `FOREIGN KEY (user_id)` → `auth.users(id)`

- **Triggers**
  - **Trigger**: `ensure_profile_uuid`
    ```sql
    BEFORE INSERT ON user_profiles
    EXECUTE FUNCTION generate_profile_uuid();
    ```

- **RLS Policies**
  - Users can read and update their own profile
  - Platform admins can read and update all profiles
  - Client admins can read profiles within their tenant
  - Basic profile info visible to authenticated users

---

### 3. platform_admins
- **Columns**
  - `id` `UUID` NOT NULL DEFAULT `gen_random_uuid()`
  - `user_id` `UUID` NOT NULL UNIQUE
    - `FOREIGN KEY (user_id)` → `auth.users(id)` ON DELETE CASCADE
  - `created_at` `TIMESTAMPTZ` NULL DEFAULT `now()`
  - `updated_at` `TIMESTAMPTZ` NULL DEFAULT `now()`

- **RLS Policies**
  - Authenticated users can check platform admin status
  - Only existing platform admins can modify the platform_admins table
  - No direct insert/update/delete access for regular users
  - Used for system-wide administrative access control

- **SQL Migration**
  ```sql
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "platform_admins_select" ON platform_admins;
  DROP POLICY IF EXISTS "platform_admins_insert" ON platform_admins;
  DROP POLICY IF EXISTS "platform_admins_delete" ON platform_admins;

  -- Create new policies
  CREATE POLICY "platform_admins_select"
  ON platform_admins
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

  CREATE POLICY "platform_admins_insert"
  ON platform_admins
  FOR INSERT
  WITH CHECK (
      auth.uid() IN (SELECT user_id FROM platform_admins WHERE user_id = auth.uid())
  );

  CREATE POLICY "platform_admins_delete"
  ON platform_admins
  FOR DELETE
  USING (
      auth.uid() IN (SELECT user_id FROM platform_admins WHERE user_id = auth.uid())
  );
  ```

---

### 4. user_settings

- **Columns**
  - `id` `UUID` NOT NULL DEFAULT `extensions.uuid_generate_v4()`
  - `user_id` `UUID` NOT NULL
  - `email_notifications` `BOOLEAN` NULL DEFAULT `true`
  - `notification_frequency` `TEXT` NULL DEFAULT `'daily'`
  - `timezone` `TEXT` NULL DEFAULT `'America/New_York'`
  - `dark_mode` `BOOLEAN` NULL DEFAULT `false`
  - `language` `TEXT` NULL DEFAULT `'en'`
  - `two_factor_auth` `BOOLEAN` NULL DEFAULT `false`
  - `created_at` `TIMESTAMPTZ` NULL DEFAULT `now()`
  - `updated_at` `TIMESTAMPTZ` NULL DEFAULT `now()`

- **Constraints & Triggers**
  - `PRIMARY KEY (id)`
  - `UNIQUE (user_id)`
  - `FOREIGN KEY (user_id)` → `auth.users(id)` ON DELETE CASCADE
  - **Trigger**: `update_user_settings_updated_at`  
    ```sql
    BEFORE UPDATE ON user_settings
    EXECUTE FUNCTION update_updated_at_column();
    ```

- **RLS Policies**
  - Users can only read and update their own settings
  - Platform admins can view all settings but cannot modify
  - No tenant-based access control needed
  - Strict user isolation for privacy

---

### 5. tenants

- **Columns**
  - `id` `UUID` NOT NULL DEFAULT `gen_random_uuid()`
  - `status` `VARCHAR(50)` NULL DEFAULT `'active'`
  - `created_at` `TIMESTAMPTZ` NULL DEFAULT `CURRENT_TIMESTAMP`
  - `updated_at` `TIMESTAMPTZ` NULL DEFAULT `CURRENT_TIMESTAMP`
  - `company_id` `UUID` NULL
  - `is_default` `BOOLEAN` NOT NULL DEFAULT `false`

- **Constraints**
  - `PRIMARY KEY (id)`
  - `UNIQUE (id)`
  - `FOREIGN KEY (company_id)` → `companies(id)`

- **RLS Policies**
  - Users can only see tenants they belong to
  - Platform admins have full access to all tenants
  - Only platform admins can create/update/delete tenants
  - Client admins can view their tenant details
  - Enforces multi-tenant isolation