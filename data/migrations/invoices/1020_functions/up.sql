CREATE OR REPLACE FUNCTION invoicing.trg_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION invoicing.trg_updated_at()
IS 'Automatically updates the updated_at field to the current timestamp whenever a row is updated in the partners table.';