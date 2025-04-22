## Revenue Forecasting — Company View Requirements

This document defines the backend requirements for the **Company View** of Ludova’s Revenue Forecasting module. Hand this spec to our AI coder (Windsurf Cascade) to implement and test the endpoints, and to wire them into the existing UI without causing lint or import errors.

---

### 1. Overview
- **Feature:** Company‑wide metrics and trends for revenue forecasting
- **Scope:** Backend API only; front‑end integration points are noted
- **Goal:** Provide endpoints that power:
  1. **Current Metrics** (monthly, annual, projected, profit margin)
  2. **Comparison** (period‑over‑period percent change)
  3. **Trends** (last N months actual vs. projected line chart)
  4. **History** (past baseline model snapshots)

---

### 2. Authentication & Multi‑Tenancy
- All routes use `createRouteHandlerClient({ cookies })` from `@supabase/auth-helpers-nextjs`.
- RLS policies already applied; _no manual_ `.eq('tenant_id',…)` in code.
- The Supabase client must be initialized inside each route handler.
- Reject any request without a valid session token.

---

### 3. Shared Configuration
- **`lib/supabase.ts`** exports:
  ```ts
  export function supabase() { /* createRouteHandlerClient */ }
  ```
- **Environment variables** in `.env.local` (server only):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `OPENROUTER_API_KEY` (for future AI scenarios)

---

### 4. Data Endpoints & Contracts

#### 4.1 Current Metrics
- **Route:** `GET /api/revenue/company/current`
- **Response:** JSON object
  ```json
  {
    "monthly": number,         // sum of this month (actual)
    "annual": number,          // sum of last 12 actual months
    "projected": number,       // monthly * 12 * (1 + growth_rate)
    "profitMargin": number     // ((annual - totalSalary) / annual) * 100
  }
  ```
- **Details:**
  - Compute `monthly` from `revenue_data` where `period_date = first of current month` & `is_projected=false`.
  - Compute `annual` via RPC or inline sum of last 12 months.
  - Load latest row from `revenue_model_params` for `growth_rate`, `employee_count`, `avg_salary`.

#### 4.2 Comparison View
- **Route:** `GET /api/revenue/company/comparison?period=monthly|annual`
- **Response:** Array of objects
  ```json
  [
    { "label": string, "current": number, "previous": number, "pctChange": number }, …
  ]
  ```
- **Details:**
  - For `period=monthly`, compare this month vs previous month.
  - For `period=annual`, compare last 12 months vs the 12 months before.
  - Compute `% = (current - previous) / previous * 100`.

#### 4.3 Trends Chart
- **Route:** `GET /api/revenue/company/trends?months=number`
- **Response:**
  ```json
  {
    "actuals": [ { "period_date": string, "amount": number } ],
    "projected": [ { "period_date": string, "amount": number } ]
  }
  ```
- **Details:**
  - `actuals`: last `months` entries from `revenue_data` where `is_projected=false`.
  - `projected`: call `/api/revenue/forecast/baseline?months=…` internally or inline math.

#### 4.4 History of Baseline Models
- **Route:** `GET /api/revenue/company/history`
- **Response:** Array
  ```json
  [
    { "modelId": uuid, "created_at": string, "employee_count": number,
      "avg_salary": number, "revenue_per_employee": number,
      "growth_rate": number }, …
  ]
  ```
- **Details:**
  - List all rows from `revenue_model_params`, ordered by `created_at DESC`.

---

### 5. Testing & Quality
- **Linting:** All TS files must satisfy ESLint/TS rules; no disable‑all pragmas.
- **Unit Tests:** Provide basic tests (Jest or Next.js test runner) to:
  - Hit each endpoint; assert 200 status and correct response shape.
  - Edge cases: missing model params, no data available.
- **Error Handling:** Return `{ error: string }` with appropriate HTTP status (400, 401, 500).

---

### 6. Front‑End Integration Points
Use SWR to fetch:
```ts
const { data: metrics } = useSWR('/api/revenue/company/current', fetcher);
const { data: comp } = useSWR(`/api/revenue/company/comparison?period=monthly`, fetcher);
const { data: trends } = useSWR(`/api/revenue/company/trends?months=12`, fetcher);
const { data: history } = useSWR('/api/revenue/company/history', fetcher);
```
Bind these to your existing cards and charts. Ensure no import paths break.

---

### 7. Delivery Checklist
- [ ] All routes implemented under `app/api/revenue/company/*`.
- [ ] Shared Supabase helper in place.
- [ ] Tests pass, lint errors resolved.
- [ ] No changes to front‑end components beyond updated service URLs.
- [ ] Verify with sample data: metrics render correctly in UI.

---

*End of spec.*

> **Next:** Deliver this Markdown to Windsurf Cascade as the prompt, then review the implemented endpoints and merge once green.

