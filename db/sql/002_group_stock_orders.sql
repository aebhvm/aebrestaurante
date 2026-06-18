ALTER TABLE stock_requests
  ADD COLUMN IF NOT EXISTS order_number varchar(40);

UPDATE stock_requests
SET order_number = 'LEG-' || id::text
WHERE order_number IS NULL;

CREATE INDEX IF NOT EXISTS stock_requests_order_number_idx
  ON stock_requests(order_number);
