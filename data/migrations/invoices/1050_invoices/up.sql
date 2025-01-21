-- Create the "invoices" table
CREATE TABLE invoicing.invoices (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  is_purchase BOOLEAN NOT NULL, -- TRUE for purchase invoice, FALSE for sales invoice
  total_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL, -- Total amount of the invoice
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_partner FOREIGN KEY (partner_id) REFERENCES invoicing.partners (id)
);

COMMENT ON TABLE invoicing.invoices
IS 'The "invoices" table stores both sales and purchase invoices, linking them to a partner and tracking their total amount.';

-- Create the "invoice_lines" table
CREATE TABLE invoicing.invoice_lines (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity >= 0),
  total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES invoicing.invoices (id) ON DELETE RESTRICT,
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES invoicing.products (id)
);

COMMENT ON TABLE invoicing.invoice_lines
IS 'The "invoice_lines" table stores details of products and services for each invoice, including calculated line totals.';

