-- Migration: Replace project_name with project_id in project_feasibility table
-- Up Migration

-- Step 1: Add project_id column (nullable at first)
ALTER TABLE project_feasibility ADD COLUMN project_id UUID;

-- Step 2: Create index on project_id (before data migration for performance)
CREATE INDEX idx_project_feasibility_project_id ON project_feasibility(project_id);

-- Step 3: Migrate data - populate project_id based on project_name
DO $$
DECLARE
    missing_projects TEXT[];
    missing_count INTEGER := 0;
BEGIN
    -- Update project_id where project_name matches a project name
    UPDATE project_feasibility pf
    SET project_id = p.id
    FROM projects p
    WHERE pf.project_name = p.name;

    -- Collect names of projects that don't have a match
    SELECT ARRAY_AGG(DISTINCT project_name)
    INTO missing_projects
    FROM project_feasibility
    WHERE project_id IS NULL;

    SELECT COUNT(*)
    INTO missing_count
    FROM project_feasibility
    WHERE project_id IS NULL;

    -- Notify about unmatched project names
    IF missing_count > 0 THEN
        RAISE WARNING 'Found % project_feasibility records with no matching project:', missing_count;
        RAISE WARNING 'Unmatched project names: %', missing_projects;
        RAISE EXCEPTION 'Data migration incomplete. Please fix missing projects before continuing.';
    END IF;
END $$;

-- Step 4: Make project_id NOT NULL after confirming all data is migrated
ALTER TABLE project_feasibility ALTER COLUMN project_id SET NOT NULL;

-- Step 5: Add foreign key constraint
ALTER TABLE project_feasibility
ADD CONSTRAINT fk_project_feasibility_project
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;

-- Step 6: Drop the old project_name column and its index
DROP INDEX IF EXISTS idx_project_feasibility_project_name;
ALTER TABLE project_feasibility DROP COLUMN project_name;

-- Down Migration

-- Rollback changes if needed
-- Step 1: Add back the project_name column
ALTER TABLE project_feasibility ADD COLUMN project_name TEXT;

-- Step 2: Restore data by looking up project names from project IDs
UPDATE project_feasibility pf
SET project_name = p.name
FROM projects p
WHERE pf.project_id = p.id;

-- Step 3: Make project_name NOT NULL
ALTER TABLE project_feasibility ALTER COLUMN project_name SET NOT NULL;

-- Step 4: Recreate the index on project_name
CREATE INDEX idx_project_feasibility_project_name ON project_feasibility(project_name);

-- Step 5: Drop the project_id foreign key constraint and column
ALTER TABLE project_feasibility DROP CONSTRAINT fk_project_feasibility_project;
DROP INDEX IF EXISTS idx_project_feasibility_project_id;
ALTER TABLE project_feasibility DROP COLUMN project_id;

