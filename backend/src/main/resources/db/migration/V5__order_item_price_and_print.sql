-- Preço por peça (opcional)
alter table order_items add column if not exists unit_price numeric(10,2);

-- Estampa do item
alter table order_items add column if not exists has_print boolean not null default false;

-- Locais de estampa de cada item (seleção múltipla)
create table if not exists item_print_locations (
  order_item_id bigint not null references order_items(id) on delete cascade,
  location varchar(30) not null
    check (location in ('FRONT_LARGE','FRONT_SMALL','BACK','SLEEVE_RIGHT','SLEEVE_LEFT')),
  primary key (order_item_id, location)
);
