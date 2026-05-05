create table if not exists clients (
  id bigserial primary key,
  type varchar(2) not null check (type in ('PF', 'PJ')),
  name varchar(200) not null,
  document varchar(30) not null,
  email varchar(200),
  phone varchar(30),
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint uq_clients_document unique (document)
);

create index if not exists idx_clients_active on clients(active);
create index if not exists idx_clients_name on clients(name);

create table if not exists products (
  id bigserial primary key,
  name varchar(200) not null,
  type varchar(100) not null,
  model varchar(100),
  collar varchar(100),
  fabric varchar(100),
  base_color varchar(100),
  has_embroidery boolean not null default false,
  has_print boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_products_name on products(name);
create index if not exists idx_products_type on products(type);

