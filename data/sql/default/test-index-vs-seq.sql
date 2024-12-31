SET random_page_cost = 1.0;
SET seq_page_cost = 1.0;

DROP TABLE IF EXISTS employees CASCADE;

CREATE TABLE employees (
  id SERIAL,
  office_id INT,
  name TEXT,
  surname TEXT,
  PRIMARY KEY (id, office_id)
);

ALTER TABLE employees ALTER COLUMN office_id SET STATISTICS 10000;


WITH config AS (
  SELECT 
    jsonb_build_object(
      'q1_tot', 100000000, 
      'q2_tot', 1,
      'cardinality', 10000001
    ) AS cfg
),
q1_seed AS (
  SELECT floor(random() * (SELECT (cfg->>'cardinality')::int - 1 FROM config) + 1)::int AS office_id, 'Name_' || (floor(random() * 500) + 1)::int AS name, 'Surname_' || (floor(random() * 500) + 1)::int AS surname
  FROM generate_series(1, (SELECT (cfg->>'q1_tot')::int FROM config))
),
q2_seed AS (
  SELECT (SELECT (cfg->>'cardinality')::int FROM config) AS office_id, 'Name_' || (floor(random() * 500) + 1)::int AS name, 'Surname_' || (floor(random() * 500) + 1)::int AS surname
  FROM generate_series(1, (SELECT (cfg->>'q2_tot')::int FROM config))
) INSERT INTO employees (office_id, name, surname) SELECT * FROM q1_seed UNION ALL SELECT * FROM q2_seed;


CREATE INDEX idx_office_id ON employees (office_id);
ANALYZE employees;

explain analyze select * from employees where office_id = 101 limit 10;
SELECT ROUND((COUNT(*) FILTER (WHERE office_id = 101)::decimal / COUNT(*) * 100), 2) AS office_11_p FROM employees;

-- QUERIES

select count(*) from employees;
select count(*) from employees where office_id = 101;
SELECT ROUND((COUNT(*) FILTER (WHERE office_id = 101)::decimal / COUNT(*) * 100), 2) AS office_11_p FROM employees;


-- From high cardinality
-- Index scan expected
explain analyze select * from employees where office_id = 5 limit 10;

-- From low cardinality (just 1)
-- Bitmap scan expected
explain analyze select * from employees where office_id = 101 limit 10;


SELECT ROUND((COUNT(*) FILTER (WHERE office_id between 1 and 228493)::decimal / COUNT(*) * 100), 2) AS office_11_p FROM employees;
explain analyze select * from employees where office_id between 1 and 228493 limit 10;



EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM employees WHERE office_id = 5;