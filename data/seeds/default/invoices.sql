-- Seed partners
INSERT INTO invoicing.partners (id, name, is_customer, is_supplier, created_at, updated_at) VALUES
('ff', 'Fresh Farms', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('os', 'Organic Suppliers', false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('hb', 'Healthy Bites', true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('gc', 'Grocery Central', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed products
INSERT INTO invoicing.products (id, name, description, price, stock_quantity, created_at, updated_at) VALUES
('apl', 'Apples', 'Fresh red apples', 1.50, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('mlk', 'Milk', '1L Organic Milk', 2.00, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('brd', 'Bread', 'Whole wheat bread', 2.50, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('egg', 'Eggs', 'Free-range eggs, dozen', 3.00, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed invoices
INSERT INTO invoicing.invoices (id, partner_id, is_purchase, total_amount, created_at, updated_at) VALUES
('i1', 'ff', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('i2', 'os', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('i3', 'hb', false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed invoice lines (purchase invoice)
INSERT INTO invoicing.invoice_lines (id, invoice_id, product_id, unit_price, quantity, created_at, updated_at) VALUES
('i1-l1', 'i1', 'apl', 1.00, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('i1-l2', 'i1', 'egg', 0.33, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('i2-l1', 'i2', 'mlk', 1.20, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('i2-l2', 'i2', 'brd', 0.8, 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('i3-l1', 'i3', 'brd', 0.95, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('i3-l2', 'i3', 'egg', 0.5, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
