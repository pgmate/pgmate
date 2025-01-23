CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA invoicing;
COMMENT ON SCHEMA invoicing IS 'This database is designed for demonstrational invoicing software, customers, suppliers, products and invoices.';