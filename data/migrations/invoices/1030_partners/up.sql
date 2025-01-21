CREATE TABLE invoicing.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_customer BOOLEAN DEFAULT FALSE,
  is_supplier BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE invoicing.partners
IS 'The "partners" table stores information about entities that can act as customers, suppliers, or both. The records are referenced by the invoices.';

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON invoicing.partners
FOR EACH ROW
EXECUTE FUNCTION invoicing.trg_updated_at();