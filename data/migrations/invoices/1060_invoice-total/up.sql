CREATE OR REPLACE FUNCTION invoicing.update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoicing.invoices
  SET total_amount = (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM invoicing.invoice_lines
    WHERE invoice_id = NEW.invoice_id
  )
  WHERE id = NEW.invoice_id;
  RETURN NULL; -- Triggers for AFTER INSERT/UPDATE/DELETE don't return rows
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION invoicing.update_invoice_total()
IS 'Updates the total_amount of an invoice whenever its lines are inserted, updated, or deleted.';

-- Triggers to update total_amount on invoice lines changes
CREATE TRIGGER after_invoice_line_crud
AFTER INSERT OR UPDATE OR DELETE ON invoicing.invoice_lines
FOR EACH ROW
EXECUTE FUNCTION invoicing.update_invoice_total();