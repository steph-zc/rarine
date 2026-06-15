-- Permite excluir um produto sem afetar pedidos já criados.
-- O nome do produto já é preservado via snapshot (product_name), então
-- basta tornar a FK nullable e usar ON DELETE SET NULL.

-- Remove a FK atual (nome automático do PostgreSQL)
alter table order_items drop constraint if exists order_items_product_id_fkey;

-- Torna product_id anulável
alter table order_items alter column product_id drop not null;

-- Recria a FK com ON DELETE SET NULL
alter table order_items add constraint order_items_product_id_fkey
  foreign key (product_id) references products(id) on delete set null;
