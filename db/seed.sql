-- Test data for workforce planning

-- Insert departments
INSERT INTO departments (id, name) VALUES
('d1b23c45-6789-0abc-def1-234567890123', 'Engineering'),
('d2c34d56-789a-bcde-f012-345678901234', 'Product'),
('d3d45e67-89ab-cdef-0123-456789012345', 'Design');

-- Insert skills
INSERT INTO skills (id, name, category) VALUES
('s1b23c45-6789-0abc-def1-234567890123', 'React', 'Frontend'),
('s2c34d56-789a-bcde-f012-345678901234', 'Node.js', 'Backend'),
('s3d45e67-89ab-cdef-0123-456789012345', 'UI/UX Design', 'Design'),
('s4e56f78-9abc-def0-1234-567890123456', 'Project Management', 'Management'),
('s5f67g89-abcd-ef01-2345-678901234567', 'DevOps', 'Infrastructure');

-- Insert positions
INSERT INTO positions (id, title, department_id, level, avg_salary) VALUES
('p1b23c45-6789-0abc-def1-234567890123', 'Senior Software Engineer', 'd1b23c45-6789-0abc-def1-234567890123', 'senior', 120000),
('p2c34d56-789a-bcde-f012-345678901234', 'Product Manager', 'd2c34d56-789a-bcde-f012-345678901234', 'manager', 130000),
('p3d45e67-89ab-cdef-0123-456789012345', 'UI/UX Designer', 'd3d45e67-89ab-cdef-0123-456789012345', 'mid', 90000);

-- Insert employees
INSERT INTO employees (id, first_name, last_name, email, position_id, department_id, hire_date, salary, performance_score) VALUES
('e1b23c45-6789-0abc-def1-234567890123', 'John', 'Doe', 'john.doe@example.com', 'p1b23c45-6789-0abc-def1-234567890123', 'd1b23c45-6789-0abc-def1-234567890123', '2023-01-15', 125000, 4.5),
('e2c34d56-789a-bcde-f012-345678901234', 'Jane', 'Smith', 'jane.smith@example.com', 'p2c34d56-789a-bcde-f012-345678901234', 'd2c34d56-789a-bcde-f012-345678901234', '2023-02-01', 135000, 4.8),
('e3d45e67-89ab-cdef-0123-456789012345', 'Mike', 'Johnson', 'mike.j@example.com', 'p3d45e67-89ab-cdef-0123-456789012345', 'd3d45e67-89ab-cdef-0123-456789012345', '2023-03-15', 95000, 4.2);

-- Insert employee skills
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level) VALUES
('e1b23c45-6789-0abc-def1-234567890123', 's1b23c45-6789-0abc-def1-234567890123', 5),
('e1b23c45-6789-0abc-def1-234567890123', 's2c34d56-789a-bcde-f012-345678901234', 4),
('e2c34d56-789a-bcde-f012-345678901234', 's4e56f78-9abc-def0-1234-567890123456', 5),
('e3d45e67-89ab-cdef-0123-456789012345', 's3d45e67-89ab-cdef-0123-456789012345', 4);

-- Insert projects
INSERT INTO projects (id, name, description, start_date, end_date, budget, status, priority, complexity, department_id) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Next-Gen Platform', 'Platform modernization project', '2024-04-01', '2024-12-31', 1000000, 'planned', 'high', 'medium', 'd1b23c45-6789-0abc-def1-234567890123');

-- Insert project skills
INSERT INTO project_skills (project_id, skill_id, required_level, required_count) VALUES
('123e4567-e89b-12d3-a456-426614174000', 's1b23c45-6789-0abc-def1-234567890123', 4, 3),
('123e4567-e89b-12d3-a456-426614174000', 's2c34d56-789a-bcde-f012-345678901234', 4, 2),
('123e4567-e89b-12d3-a456-426614174000', 's5f67g89-abcd-ef01-2345-678901234567', 3, 1);

-- Insert project allocations
INSERT INTO project_allocations (project_id, employee_id, allocation_percentage, start_date, end_date, role) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'e1b23c45-6789-0abc-def1-234567890123', 80, '2024-04-01', '2024-12-31', 'Tech Lead');

-- Insert employee performance records
INSERT INTO employee_performance (employee_id, review_date, performance_score, satisfaction_score, workload_score) VALUES
('e1b23c45-6789-0abc-def1-234567890123', '2024-03-01', 4.5, 4.2, 3.8),
('e2c34d56-789a-bcde-f012-345678901234', '2024-03-01', 4.8, 4.5, 4.0),
('e3d45e67-89ab-cdef-0123-456789012345', '2024-03-01', 4.2, 4.0, 3.5);

-- Insert workforce plans
INSERT INTO workforce_plans (project_id, department_id, plan_date, required_headcount, current_headcount, forecasted_headcount, attrition_rate, growth_rate) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'd1b23c45-6789-0abc-def1-234567890123', '2024-04-01', 6, 1, 4, 0.15, 0.25); 