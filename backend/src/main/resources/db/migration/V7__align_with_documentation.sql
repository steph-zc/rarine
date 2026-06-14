-- Alinhamento com a documentação (relatório final como referência principal).

-- 1) Status da OS conforme o ciclo documentado: Pedido -> Producao -> Pronto -> Entregue
alter table orders alter column status drop default;

-- Remove o CHECK antigo ANTES de converter os valores (nome pode variar)
do $$
declare r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'orders' and con.contype = 'c'
  loop
    execute 'alter table orders drop constraint ' || quote_ident(r.conname);
  end loop;
end $$;

update orders set status = case status
  when 'OPEN'        then 'PEDIDO'
  when 'IN_PROGRESS' then 'PRODUCAO'
  when 'DONE'        then 'ENTREGUE'
  when 'CANCELLED'   then 'PEDIDO'
  else status
end;

alter table orders
  add constraint orders_status_check
  check (status in ('PEDIDO','PRODUCAO','PRONTO','ENTREGUE'));

alter table orders alter column status set default 'PEDIDO';

-- 2) Snapshot do nome do produto no item da OS (RN02.01)
alter table order_items add column if not exists product_name varchar(200);
update order_items oi
  set product_name = p.name
  from products p
  where p.id = oi.product_id and oi.product_name is null;

-- 3) Locais de aplicação por produto (PRODUTO_LOCAL_APLICACAO)
create table if not exists product_application_locations (
  id         bigserial primary key,
  product_id bigint not null references products(id) on delete cascade,
  location   varchar(50) not null,   -- frente, costas, manga
  size       varchar(20)             -- pequeno, grande (opcional)
);
create index if not exists idx_pal_product_id on product_application_locations(product_id);
