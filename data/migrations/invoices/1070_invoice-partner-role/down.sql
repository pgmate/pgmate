DROP TRIGGER IF EXISTS trg_check_invoice_partner_role ON invoicing.invoices;
DROP FUNCTION IF EXISTS invoicing.check_invoice_partner_role;

DROP TRIGGER IF EXISTS trg_check_partner_role ON invoicing.partners;
DROP FUNCTION IF EXISTS invoicing.check_partner_role;
