DROP TRIGGER IF EXISTS update_invoice_total_trigger ON invoice_details;
DROP TRIGGER IF EXISTS ensure_invoice_integrity_by_master_trigger ON invoice_master;
DROP TRIGGER IF EXISTS ensure_invoice_integrity_by_details_trigger ON invoice_details;

DROP FUNCTION IF EXISTS update_invoice_total;
DROP FUNCTION IF EXISTS ensure_invoice_integrity_by_master;
DROP FUNCTION IF EXISTS ensure_invoice_integrity_by_details;

DROP TABLE IF EXISTS invoice_details CASCADE;
DROP TABLE IF EXISTS invoice_master CASCADE;

CREATE TABLE invoice_master (
    id SERIAL PRIMARY KEY,
    invoice_date TIMESTAMP NOT NULL DEFAULT NOW(),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE TABLE invoice_details (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (invoice_id) REFERENCES invoice_master (id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the total_amount for the OLD.invoice_id after DELETE or UPDATE
    IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.invoice_id != NEW.invoice_id) THEN
        UPDATE invoice_master
        SET total_amount = COALESCE((
            SELECT SUM(total_amount)
            FROM invoice_details
            WHERE invoice_id = OLD.invoice_id
        ), 0)
        WHERE id = OLD.invoice_id;
    END IF;

    -- Update the total_amount for the NEW.invoice_id after INSERT or UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE invoice_master
        SET total_amount = COALESCE((
            SELECT SUM(total_amount)
            FROM invoice_details
            WHERE invoice_id = NEW.invoice_id
        ), 0)
        WHERE id = NEW.invoice_id;
    END IF;

    RETURN NULL; -- Triggers on AFTER events don't require a return value
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_total_trigger
AFTER INSERT OR UPDATE OR DELETE
ON invoice_details
FOR EACH ROW
EXECUTE FUNCTION update_invoice_total();

CREATE OR REPLACE FUNCTION ensure_invoice_integrity_by_master()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure that the new invoice has at least one line item
    IF NOT EXISTS (
        SELECT 1
        FROM invoice_details
        WHERE invoice_id = NEW.id
        LIMIT 1
    ) THEN
        RAISE EXCEPTION 'An invoice must have at least one line item.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ensure_invoice_integrity_by_master_trigger
AFTER INSERT OR UPDATE
ON invoice_master
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION ensure_invoice_integrity_by_master();

CREATE OR REPLACE FUNCTION ensure_invoice_integrity_by_details()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip the integrity check if the parent invoice is being deleted
    IF NOT EXISTS (
        SELECT 1
        FROM invoice_master
        WHERE id = OLD.invoice_id
    ) THEN
        RETURN OLD; -- Parent invoice does not exist, so skip the check
    END IF;

    CASE TG_OP
        WHEN 'DELETE' THEN
            -- Ensure the associated invoice still has line items after deletion
            IF NOT EXISTS (
                SELECT 1
                FROM invoice_details
                WHERE invoice_id = OLD.invoice_id
                LIMIT 1
            ) THEN
                RAISE EXCEPTION 'Cannot delete the last line item of an invoice.';
            END IF;

        WHEN 'UPDATE' THEN
            -- Ensure OLD.invoice_id still has line items if invoice_id has changed
            IF OLD.invoice_id != NEW.invoice_id THEN
                IF NOT EXISTS (
                    SELECT 1
                    FROM invoice_details
                    WHERE invoice_id = OLD.invoice_id
                    LIMIT 1
                ) THEN
                    RAISE EXCEPTION 'Cannot move the last line item of an invoice to another invoice.';
                END IF;
            END IF;
    END CASE;

    RETURN CASE
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ensure_invoice_integrity_by_details_trigger
AFTER DELETE OR UPDATE
ON invoice_details
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION ensure_invoice_integrity_by_details();

CREATE OR REPLACE FUNCTION create_invoice()
RETURNS SETOF invoice_master AS $$
DECLARE
    new_invoice_id INT;
BEGIN
    -- Create a new invoice and capture its ID
    WITH
    new_invoice AS (
        INSERT INTO invoice_master (invoice_date)
        VALUES (NOW())
        RETURNING id
    ),
    new_details AS (
    	INSERT INTO invoice_details (invoice_id, description, quantity, unit_price)
	    VALUES
	      ((SELECT id FROM new_invoice), 'Item Description 1', 2, 50.00),
	      ((SELECT id FROM new_invoice), 'Item Description 2', 1, 25.00)
	    RETURNING invoice_id
    )
    SELECT invoice_id FROM new_details LIMIT 1 INTO new_invoice_id;

    -- Return the full invoice_master row after triggers have executed
    RETURN QUERY SELECT * FROM invoice_master WHERE id = new_invoice_id;
END;
$$ LANGUAGE plpgsql;






INSERT INTO invoice_master (invoice_date) VALUES (NOW()) RETURNING *;


WITH
new_invoice AS (
    INSERT INTO invoice_master (invoice_date)
    VALUES (NOW())
    RETURNING *
),
new_details AS (
	INSERT INTO invoice_details (invoice_id, description, quantity, unit_price)
    VALUES
      ((SELECT id FROM new_invoice), 'Item Description 1', 2, 50.00),
      ((SELECT id FROM new_invoice), 'Item Description 2', 1, 25.00)
    RETURNING invoice_id
)
select * from new_invoice;


select * from invoice_master where id = 12;






select * from create_invoice();


DELETE FROM invoice_master WHERE id = 1;

select * from invoice_master;
select * from invoice_details;


DELETE FROM invoice_master WHERE id = 1;
delete from invoice_details where id = 4;

update invoice_details set invoice_id = 5 where id = 5;