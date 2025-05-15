1. companies
Stores your real‐world organizations.

Column	Type	Description
id	uuid	PK, unique company identifier
name	text	company name
status	varchar	active/inactive
created_at	timestamp with time zone	when the row was created
updated_at	timestamp with time zone	last update timestamp
2. tenants
Isolation “workspaces” per company.

Column	Type	Description
id	uuid	PK, unique tenant identifier
company_id	uuid	FK → companies(id)
status	varchar	if the tenant is active or not
is_default	boolean	marks the company’s default workspace (we added this)
created_at	timestamp with time zone	when the tenant was created
updated_at	timestamp with time zone	last time the tenant row was updated
3. tenant_users
Joins users to tenants with specific roles.

Column	Type	Description
id	uuid	PK, unique mapping ID
tenant_id	uuid	FK → tenants(id)
user_id	uuid	FK → auth.users(id) (via user_profiles)
role	text	platform_admin, company_admin, or sub_user
created_at	timestamp with time zone	when the mapping was created
updated_at	timestamp with time zone	last update timestamp
4. user_profiles
Holds your users’ public info + admin flag.

Column	Type	Description
id	uuid	PK, profile ID (could be same as user_id)
user_id	uuid	FK → auth.users(id)
email	text	user’s email
name	text	display name
role	text	app-level role (default user)
is_platform_admin	boolean	bypass-all flag for super-admins
created_at	timestamp with time zone	when profile was created
updated_at	timestamp with time zone	last time profile was updated
5. user_settings
Stores per-user preferences.

Column	Type	Description
id	uuid	PK, unique settings row
user_id	uuid	FK → auth.users(id)
email_notifications	boolean	if true, user gets email alerts
notification_frequency	text	e.g. daily, weekly
timezone	text	user’s chosen tz (defaulted via trigger)
dark_mode	boolean	UI theme preference
language	text	interface language (e.g. en)
two_factor_auth	boolean	whether 2FA is on
created_at	timestamp with time zone	when the settings were first created
updated_at	timestamp with time zone	last time the settings were updated
