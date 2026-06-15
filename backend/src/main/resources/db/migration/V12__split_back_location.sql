-- Divide o local de estampa/bordado "Costa" (BACK) em dois tamanhos:
-- "Costas grande" (BACK_LARGE) e "Costas pequeno" (BACK_SMALL).

-- 1) Remove o CHECK antigo da coluna location (nome pode variar)
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

-- 2) Migra os registros existentes: BACK -> BACK_LARGE (tamanho grande como padrão)
update item_embroideries set location = 'BACK_LARGE' where location = 'BACK';

-- 3) Aplica o novo CHECK com os 6 locais
alter table item_embroideries
  add constraint item_embroideries_location_check
  check (location in ('FRONT_LARGE','FRONT_SMALL','BACK_LARGE','BACK_SMALL','SLEEVE_RIGHT','SLEEVE_LEFT'));
