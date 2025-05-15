# Organization Chart Generation

The HR Suite includes a powerful AI-enhanced organization chart generator with fallback capability.

## Overview

The organization chart generator creates hierarchical org charts based on employee and department data stored in the Supabase database. It processes user prompts to understand requirements and can place employees in specific departments based on natural language instructions.

## Key Features

### 1. AI-Powered Generation

The primary generation method uses the Together AI API with the Mixtral-8x7B-Instruct model to interpret user prompts and create organization charts. The AI model:

- Understands natural language instructions
- Places employees in appropriate positions based on their job titles
- Creates a hierarchical structure respecting reporting relationships
- Provides additional metadata about departments

### 2. Smart Employee Name Matching

The system uses sophisticated pattern matching to recognize employee names mentioned in prompts:

- Full name matching (e.g., "Brad Pitt")
- First name or last name matching (e.g., "Brad" or "Pitt")
- Partial name matching with 4+ character threshold (e.g., "Brad" matches "Bradley")
- Handles punctuation and case insensitivity

### 3. Department Placement Instructions

Users can specify department placements for employees using natural language:

#### "Head of Department" Pattern
```
[Employee] as head of [Department]
[Employee] as manager of [Department]
[Employee] as director of [Department]
[Employee] as lead of [Department]
```

#### "In Department" Pattern
```
[Employee] in [Department]
[Employee] in the [Department]
```

The system prioritizes management assignments over regular placements.

### 4. Robust Fallback Generation

If the AI service is unavailable or encounters an error, the system falls back to a rule-based chart generator that:

1. Extracts employee names and department placements from the prompt
2. Intelligently selects department heads based on:
   - Explicitly requested department heads in the prompt
   - Employees with manager/head/director/lead in their titles
   - Any mentioned employee in the department
3. Creates a hierarchical structure with:
   - CEO/Executive at the top
   - Department heads as direct reports
   - Department employees under their respective heads
4. Adds metadata like employee counts and estimated budgets

## Implementation Details

### API Endpoints

- **POST /api/organization/generate**
  - Takes a prompt, structureType, and useAI flag
  - Returns a JSON structure representing the org chart

- **GET /api/organization/test-employees**
  - Returns a list of all employees and departments for testing

### Testing Tools

- **npm run test:org** - Tests the chart generation logic directly
- **npm run test:org-api** - Tests the API endpoints for chart generation

## Example Usage

```javascript
// Client-side code to generate an org chart
const response = await fetch('/api/organization/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Create an org chart with Brad as head of Marketing and Farzana in Sales",
    structureType: 'detailed',
    useAI: true
  })
});

const orgChart = await response.json();
```

## Organization Chart Structure

```javascript
{
  "id": "user-1",             // Employee ID or generated ID
  "name": "John Doe",         // Employee name
  "title": "CEO",             // Employee title/position
  "department": "Executive",  // Department name
  "children": [               // Reports/subordinates
    {
      "id": "user-2",
      "name": "Jane Smith",
      "title": "Head of Engineering",
      "department": "Engineering",
      "children": [...]
    }
  ],
  "metadata": {               // Optional additional data
    "employeeCount": 10,
    "budget": 1000000
  }
}
``` 