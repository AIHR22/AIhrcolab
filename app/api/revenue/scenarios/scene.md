## Revenue Forecasting — What‑If Scenarios Requirements

This document defines the backend requirements for the **What‑If Scenarios** feature of Ludova’s Revenue Forecasting module. Hand this spec to our AI coder (Windsurf Cascade) to implement and test the endpoints, and to integrate with the existing UI without causing lint or import errors.

---

### 1. Overview
- **Feature:** AI‑driven and slider‑driven custom scenarios for revenue forecasting
- **Scope:** Backend API only; front‑end integration points are noted for scenario builder, custom sliders, history listing, and scenario details
- **Goal:** Provide endpoints that:
  1. **Create** a new scenario via natural‑language input (`builder`)
  2. **Create** a custom parameter scenario via structured sliders (`custom`)
  3. **List** saved or predefined scenarios (`index`)
  4. **Retrieve** and **delete** individual scenarios by ID (`[scenarioId]`)

---

### 2. Authentication & Multi‑Tenancy
- Use `createRouteHandlerClient({ cookies })` from `@supabase/auth-helpers-nextjs` in each route.
- RLS ensures tenant isolation; _no_ manual `.eq('tenant_id',…)` in code.
- Reject any request without a valid session token.

---

### 3. Shared Configuration
- **`lib/supabase.ts`**: shared Supabase client.
- **`lib/openrouterFetch.ts`**: `deepseekChat(messages)` for AI calls.
- **Environment variables** in `.env.local`:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `OPENROUTER_API_KEY`

---

### 4. Endpoints & Contracts

#### 4.1 Scenario Builder (Natural Language)
- **Route:** `POST /api/revenue/scenarios/builder`
- **Request Body:**
  ```json
  { "text": "Add 5 engineers and reduce attrition by 2%" }
  ```
- **Processing Steps:**
  1. Fetch latest `revenue_model_params`.
  2. Build AI prompt with base params and user text.
  3. Call `deepseekChat` to parse adjustments and forecast.
  4. Parse AI JSON response, extract:
     ```json
     {
       "adjustments": { "employee_count": number, "growth_rate": number, … },
       "forecast": [{ "period_date": string, "amount": number }, …],
       "impact": number
     }
     ```
  5. Insert into `scenarios` table: `{ prompt: text, params: adjustments, impact_amount: impact }`.
- **Response:**
  ```json
  {
    "scenario": { /* inserted scenario record */ },
    "forecast": [ /* forecast array */ ],
    "impact": number
  }
  ```
- **Error Handling:** return `{ error }` with status 400, 502, or 500.

#### 4.2 Custom Scenarios (Sliders)
- **Route:** `POST /api/revenue/scenarios/custom`
- **Request Body:**
  ```json
  {
    "params": {
      "marketingSpend": number,
      "attritionRate": number,
      "newHires": number,
      …
    }
  }
  ```
- **Processing Steps:**
  1. Fetch last 6 months of `revenue_data` actuals.
  2. Build AI prompt including history and slider params.
  3. Call `deepseekChat` to project next 12 months array.
  4. Parse response as `[{ period_date, amount }, …]`.
  5. Compute total impact vs baseline.
  6. Insert into `scenarios`: `{ prompt: null, params, impact_amount }`.
- **Response:**
  ```json
  { "scenario": { … }, "forecast": [ … ], "impact": number }
  ```

#### 4.3 Scenario Index (Listing)
- **Route:** `GET /api/revenue/scenarios`
- **Response:**
  ```json
  [
    { "id": uuid, "prompt": string | null, "created_at": string, "impact_amount": number }, …
  ]
  ```
- **Details:** List all `scenarios` rows, ordered `created_at DESC`.

#### 4.4 Scenario CRUD by ID
- **Route:** `GET /api/revenue/scenarios/[scenarioId]`
  - Return full scenario with `params`, `impact_amount`, and optionally saved `forecast` series.
- **Route:** `DELETE /api/revenue/scenarios/[scenarioId]`
  - Delete the scenario row and any associated `revenue_data` projections.

---

### 5. Front‑End Integration Points
- **Builder:** use SWR mutation on `/api/revenue/scenarios/builder` with text arg.
- **Custom:** SWR mutation on `/api/revenue/scenarios/custom` with params object.
- **History:** `useSWR('/api/revenue/scenarios')` to populate scenario list UI.
- **Detail/Delete:** `fetch` on `/api/revenue/scenarios/{id}` for edit or removal actions.

---

### 6. Testing & Quality
- **Linting:** pass ESLint/TS checks.
- **Tests:** mock Supabase and OpenRouter, verify request/response shapes.
- **Edge Cases:** no AI JSON, DB insert failures, invalid scenarioId → proper HTTP codes.

---

### 7. Delivery Checklist
- [ ] Endpoints under `app/api/revenue/scenarios/*` per spec.
- [ ] AI integration via `deepseekChat` correctly imported.
- [ ] Unit and integration tests in place.
- [ ] Front‑end wiring tested; no UI or import errors.

---

*End of What‑If Scenarios spec.*

