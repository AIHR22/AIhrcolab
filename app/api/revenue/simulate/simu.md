## Revenue Forecasting — Profitability Simulator Requirements

This document defines the backend requirements for the **Profitability Simulator** feature of Ludova’s Revenue Forecasting module. Hand this spec to our AI coder (Windsurf Cascade) to implement and test the endpoints, and to integrate with the existing UI without causing lint or import errors.

---

### 1. Overview
- **Feature:** AI‑driven profitability simulation by department
- **Scope:** Backend API only; front‑end integration points are noted for the simulator table and chart
- **Goal:** Provide an endpoint that:
  1. **Fetches baseline data** (headcount, revenue per employee)
  2. **Accepts user adjustments** (delta headcount per department)
  3. **Invokes DeepSeek AI** to compute new headcount, revenue, and impact
  4. **Returns structured JSON** for UI to render updated table and impact summary

---

### 2. Authentication & Multi‑Tenancy
- Use `createRouteHandlerClient({ cookies })` from `@supabase/auth-helpers-nextjs` in each route.
- RLS ensures tenant isolation; no manual `.eq('tenant_id',…)` in code.
- Reject any request without a valid session token.

---

### 3. Shared Configuration
- **`lib/supabase.ts`** exports the shared Supabase client.
- **`lib/openrouterFetch.ts`** exports `deepseekChat(messages)` to call `deepseek/deepseek-chat` via OpenRouter.
- **Environment variables** in `.env.local` (server only):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - `OPENROUTER_API_KEY`

---

### 4. Data Endpoint & Contract

#### 4.1 Simulator Endpoint
- **Route:** `POST /api/revenue/simulate`
- **Request Body:** JSON object
  ```json
  {
    "adjustments": [
      { "departmentId": "uuid", "deltaHeadcount": number },
      …
    ]
  }
  ```
- **Processing Steps:**
  1. **Fetch baseline** department rows from `department_revenue` or via join:
     - `department_id`, `department_name`, `headcount`, `revenue_per_employee`
  2. **Build AI prompt** including baseline data and user adjustments.
  3. **Call `deepseekChat`** with the prompt (model `deepseek/deepseek-chat`).
  4. **Parse AI JSON response** into an array:
     ```json
     [
       {
         "departmentId": "uuid",
         "newHeadcount": number,
         "newRevenue": number,
         "impact": number
       }, …
     ]
     ```
- **Response:** JSON object
  ```json
  {
    "simulation": [
      { "departmentId": "…", "newHeadcount": 0, "newRevenue": 0, "impact": 0 }, …
    ]
  }
  ```
- **Error Handling:**
  - Return `{ error: string }` with status 400 (bad input) or 502 (AI failure) or 500 (server/db error).

---

### 5. Front‑End Integration Points
- **React service call** example:
  ```ts
  async function runSimulation(adjustments) {
    const res = await fetch('/api/revenue/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustments }),
    });
    return res.json();
  }
  ```
- **UI binding:**
  - Pass current table adjustments state (dept IDs and delta values) to the service.
  - On response, update table rows (`newHeadcount`, `impact`) and render a summary card for total impact.

---

### 6. Testing & Quality
- **Linting:** TS files must pass ESLint/TS without disable‑all directives.
- **Unit Tests:** Jest or Next.js tests to:
  - Mock Supabase and OpenRouter calls.
  - Assert correct request shape, AI prompt content, and response parsing.
- **Edge Cases:**
  - No departments found → return empty array.
  - AI returns invalid JSON → error 502.

---

### 7. Delivery Checklist
- [ ] `app/api/revenue/simulate/route.ts` implemented per spec.
- [ ] `openrouterFetch.ts` imported and used correctly.
- [ ] Tests covering success and failure scenarios.
- [ ] Front‑end integration points verified in UI (no import errors).

---

*End of Profitability Simulator spec.*

> **Next:** Feed this Markdown to Windsurf Cascade, review the endpoint, and integrate into the simulator table UI.

