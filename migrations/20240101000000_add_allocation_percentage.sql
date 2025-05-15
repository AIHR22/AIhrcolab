-- Add allocation_percentage column to project_allocations table
ALTER TABLE project_allocations
ADD COLUMN allocation_percentage integer NOT NULL DEFAULT 25
CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100);
