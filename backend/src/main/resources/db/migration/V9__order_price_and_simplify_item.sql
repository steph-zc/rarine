-- Preço lançado por pedido (texto livre, consultável no perfil do cliente)
alter table orders add column if not exists price varchar(100);

-- Remove o preço por item (não é mais usado; o preço passa a ser por pedido)
alter table order_items drop column if exists unit_price;

-- Tamanho, quantidade e observações do item passam a ser preenchidos à mão na
-- ficha impressa; mantemos as colunas (quantidade fixada em 1 pelo sistema).
alter table order_items alter column quantity set default 1;
