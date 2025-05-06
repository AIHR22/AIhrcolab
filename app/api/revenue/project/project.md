## Revenue Forecasting — Project View Requirements

This document defines the backend requirements for the **Project View** feature of Ludova’s Revenue Forecasting module. Hand this spec to our AI coder (Windsurf Cascade) to implement and test the endpoints, and to integrate with the existing UI without causing lint or import errors.

---

### 1. Overview
- **Feature**: Display revenue breakdown and insights for individual projects
- **Scope**: Backend API only; front‑end integration points noted for project overview, comparison, what‑if, and history tabs under a given `[projectId]` route
- **Goal**: Provide endpoints  to:
  1. **Overview**: List active projects and their revenue figures (`index`)
  2. **Detail**: Fetch metrics for a single project (`[projectId]/overview`)
  3. **Comparison**: Compare this project’s revenue vs previous period (`[projectId]/comparison`)
  4. **What‑If**: Run scenario builder for project-specific adjustments (`[projectId]/what-if`)
  5. **History**: List saved scenarios and impacts for this project (`[projectId]/history`)

---

### 2. Authentication & Multi‑Tenancy
- Use `createRouteHandlerClient({ cookies })`
- RLS ensures tenant and project isolation; _no_ manual `.eq('tenant_id',…)` or `.eq('project_id',…)` in code.
- Reject requests without a valid session.

---

### 3. Shared Configuration
- **`lib/supabase.ts`**: shared Supabase client
- **`lib/openrouterFetch.ts`**: `deepseekChat(messages)` for AI calls
- **Env Vars** in `.env.local`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENROUTER_API_KEY`

---

### 4. Endpoints & Contracts

#### 4.1 List Projects
- **Route**: `GET /api/revenue/projects`
- **Response**:
  ```json
  [
    { "id": uuid, "name": string, "status": string, "revenue": number }, …
  ]
  ```
- **Details**: Only include projects with revenue data or active status.

#### 4.2 Project Overview
- **Route**: `GET /api/revenue/projects/[projectId]/overview`
- **Processing**:
  1. Fetch baseline model parameters for project (`revenue_model_params` filtered by `project_id`).
  2. Aggregate actual `revenue_data` for last 6 months (`is_projected=false`).
  3. Sum projected next 12 months (`is_projected=true`) if present, else compute using model.
- **Response**:
  ```json
  {
    "project": { "id": uuid, "name": string },
    "metrics": {
      "monthly": number,
      "annual": number,
      "projected": number,
      "profitMargin": number
    }
  }
  ```

#### 4.3 Metric Comparison
- **Route**: `GET /api/revenue/projects/[projectId]/comparison?period=monthly|quarterly|yearly`
- **Request Params**: `period` enum (default `monthly`)
- **Processing**:
  1. Sum `revenue_data` for current and previous periods.
  2. Calculate percentage change.
- **Response**:
  ```json
  {
    "current": [ { "period": string, "amount": number }, … ],
    "previous": [ { "period": string, "amount": number }, … ]
  }
  ```

#### 4.4 Project‑Specific What‑If Scenarios
- **Route**: `POST /api/revenue/projects/[projectId]/what-if`
- **Body**: same shape as global what-if but scoped to project
- **Processing**:
  - Include project historical data in AI prompt
  - Save returned scenario under `project_id`
- **Response**: forecast series and impact

#### 4.5 Scenario History
- **Route**: `GET /api/revenue/projects/[projectId]/history`
- **Response**:
  ```json
  [ { "id": uuid, "type": "builder"|"custom", "created_at": string, "impact_amount": number }, … ]
  ```

---

### 5. Front‑End Integration
- **Index**: `useSWR('/api/revenue/projects')` populates project dropdown
- **Overview**: `useSWR(`/api/revenue/projects/${id}/overview`)`
- **Comparison**: SWR with `?period=` query
- **What‑If**: mutation hook on `/what-if`
- **History**: SWR on `/history`

---

### 6. Testing & Quality
- **Lint**: pass ESLint/TS
- **Unit Tests**: mock Supabase and AI client
- **Edge Cases**: handle missing project, invalid period, AI failures

---

### 7. Delivery Checklist
- [ ] Folder `app/api/revenue/projects` mirrors spec
- [ ] Endpoints implemented under `[projectId]/*`
- [ ] AI integration leverages `deepseekChat`
- [ ] E2E front‑end smoke tests: no UI or import errors

*End of Project View spec.*

