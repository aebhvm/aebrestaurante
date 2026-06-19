ALTER TABLE stock_requests
  ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE stock_requests
  DROP CONSTRAINT IF EXISTS stock_requests_product_id_stock_products_id_fk;

ALTER TABLE stock_requests
  DROP CONSTRAINT IF EXISTS stock_requests_product_id_fkey;

ALTER TABLE stock_requests
  ADD CONSTRAINT stock_requests_product_id_stock_products_id_fk
  FOREIGN KEY (product_id)
  REFERENCES stock_products(id)
  ON DELETE SET NULL;
