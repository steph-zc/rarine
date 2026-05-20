-- Cores de bordado
create table if not exists embroidery_colors (
  id          bigserial primary key,
  name        varchar(100) not null,
  thread_code varchar(50)  not null,
  brand       varchar(100),
  created_at  timestamp with time zone not null default now(),
  updated_at  timestamp with time zone not null default now()
);

create index if not exists idx_embroidery_colors_name on embroidery_colors(name);

-- Ordens de serviço
create table if not exists orders (
  id           bigserial primary key,
  client_id    bigint not null references clients(id),
  status       varchar(30) not null default 'OPEN'
                 check (status in ('OPEN','IN_PROGRESS','DONE','CANCELLED')),
  deadline     date,
  notes        text,
  created_at   timestamp with time zone not null default now(),
  updated_at   timestamp with time zone not null default now()
);

create index if not exists idx_orders_client_id on orders(client_id);
create index if not exists idx_orders_status    on orders(status);

-- Itens da OS
create table if not exists order_items (
  id         bigserial primary key,
  order_id   bigint not null references orders(id) on delete cascade,
  product_id bigint not null references products(id),
  color      varchar(100),
  size       varchar(30),
  collar     varchar(100),
  fabric     varchar(100),
  quantity   int not null check (quantity > 0),
  notes      text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_order_items_order_id on order_items(order_id);

-- Bordados de cada item
create table if not exists item_embroideries (
  id          bigserial primary key,
  order_item_id bigint not null references order_items(id) on delete cascade,
  location    varchar(50) not null check (location in ('FRONT','BACK','SLEEVE','OTHER')),
  description text,
  created_at  timestamp with time zone not null default now(),
  updated_at  timestamp with time zone not null default now()
);

-- Cores usadas em cada bordado (N:N)
create table if not exists item_embroidery_colors (
  item_embroidery_id bigint not null references item_embroideries(id) on delete cascade,
  embroidery_color_id bigint not null references embroidery_colors(id),
  primary key (item_embroidery_id, embroidery_color_id)
);

-- Anexos da OS
create table if not exists order_attachments (
  id         bigserial primary key,
  order_id   bigint not null references orders(id) on delete cascade,
  file_type  varchar(50),
  file_path  varchar(500) not null,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_order_attachments_order_id on order_attachments(order_id);

-- Triggers de updated_at
drop trigger if exists trg_embroidery_colors_updated_at on embroidery_colors;
create trigger trg_embroidery_colors_updated_at
  before update on embroidery_colors
  for each row execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

drop trigger if exists trg_order_items_updated_at on order_items;
create trigger trg_order_items_updated_at
  before update on order_items
  for each row execute function set_updated_at();

drop trigger if exists trg_item_embroideries_updated_at on item_embroideries;
create trigger trg_item_embroideries_updated_at
  before update on item_embroideries
  for each row execute function set_updated_at();

drop trigger if exists trg_order_attachments_updated_at on order_attachments;
create trigger trg_order_attachments_updated_at
  before update on order_attachments
  for each row execute function set_updated_at();
