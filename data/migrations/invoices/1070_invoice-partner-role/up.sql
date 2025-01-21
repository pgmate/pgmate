CREATE OR REPLACE FUNCTION invoicing.check_invoice_partner_role()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.is_purchase AND NOT (SELECT is_supplier FROM invoicing.partners WHERE id = NEW.partner_id)) THEN
    RAISE EXCEPTION 'The partner must be a supplier for purchase invoices';
  ELSIF (NOT NEW.is_purchase AND NOT (SELECT is_customer FROM invoicing.partners WHERE id = NEW.partner_id)) THEN
    RAISE EXCEPTION 'The partner must be a customer for sales invoices';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION invoicing.check_invoice_partner_role()
IS 'Ensures that the partner referenced in an invoice has the correct role: supplier for purchase invoices or customer for sales invoices.';

CREATE TRIGGER trg_check_invoice_partner_role
BEFORE INSERT OR UPDATE ON invoicing.invoices
FOR EACH ROW
EXECUTE FUNCTION invoicing.check_invoice_partner_role();

COMMENT ON TRIGGER trg_check_invoice_partner_role ON invoicing.invoices
IS 'Enforces partner role validation on insert or update operations in the invoices table.';



-- Add a trigger function to prevent invalid updates on the partners table
CREATE OR REPLACE FUNCTION invoicing.check_partner_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent changing is_supplier to FALSE if there are referenced purchase invoices
  IF (OLD.is_supplier AND NOT NEW.is_supplier) THEN
    IF EXISTS (
      SELECT 1
      FROM invoicing.invoices
      WHERE partner_id = OLD.id AND is_purchase = TRUE
    ) THEN
      RAISE EXCEPTION 'Cannot set is_supplier to FALSE: Partner has referenced purchase invoices.';
    END IF;
  END IF;

  -- Prevent changing is_customer to FALSE if there are referenced sales invoices
  IF (OLD.is_customer AND NOT NEW.is_customer) THEN
    IF EXISTS (
      SELECT 1
      FROM invoicing.invoices
      WHERE partner_id = OLD.id AND is_purchase = FALSE
    ) THEN
      RAISE EXCEPTION 'Cannot set is_customer to FALSE: Partner has referenced sales invoices.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION invoicing.check_partner_role()
IS 'Ensures that the partner is correctly flagged as supplier and/or customer based on the type of the referenced invoices (is_purchase).';

-- Attach the trigger to the partners table
CREATE TRIGGER trg_check_partner_role
BEFORE UPDATE ON invoicing.partners
FOR EACH ROW
EXECUTE FUNCTION invoicing.check_partner_role();

COMMENT ON TRIGGER trg_check_partner_role ON invoicing.partners
IS 'Enforces to check on the integrity of the partner''s role on update .';