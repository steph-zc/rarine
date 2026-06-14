-- Unifica estampa e bordado num só conceito: item_embroideries passa a usar os
-- 5 locais de estampa (com cores por local, que a tabela item_embroidery_colors já suporta).

-- 1) Remove quaisquer constraints CHECK existentes na coluna location (nome pode variar)
do $$
declare r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'item_embroideries' and con.contype = 'c'
  loop
    execute 'alter table item_embroideries drop constraint ' || quote_ident(r.conname);
  end loop;
end $$;

-- 2) Migra os valores antigos para o novo conjunto de locais
update item_embroideries set location = case location
  when 'FRONT'  then 'FRONT_LARGE'
  when 'SLEEVE' then 'SLEEVE_RIGHT'
  when 'OTHER'  then 'FRONT_LARGE'
  else location
end;

-- 3) Aplica o novo CHECK
alter table item_embroideries
  add constraint item_embroideries_location_check
  check (location in ('FRONT_LARGE','FRONT_SMALL','BACK','SLEEVE_RIGHT','SLEEVE_LEFT'));

-- 4) Remove o modelo simples de locais de estampa (V5), substituído pelo modelo acima
drop table if exists item_print_locations;
