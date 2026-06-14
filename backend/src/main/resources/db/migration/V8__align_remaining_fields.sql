-- Alinhamento dos campos restantes com a documentação (relatório + ER/ERD + requisitos).

-- 1) Manga como característica do item (ItemOS.manga)
alter table order_items add column if not exists manga varchar(50);

-- 2) Hex da cor de bordado como campo próprio (CorBordado.hex_cor)
alter table embroidery_colors add column if not exists hex_color varchar(7);

-- backfill: extrai #rrggbb do final do nome (ex.: "Azul Royal (#2040A0)")
update embroidery_colors
  set hex_color = '#' || upper(substring(name from '#([0-9A-Fa-f]{6})'))
  where hex_color is null and name ~ '#[0-9A-Fa-f]{6}';

-- remove o sufixo de hex do nome, deixando o nome limpo
update embroidery_colors
  set name = btrim(regexp_replace(name, '\s*\(#?[0-9A-Fa-f]{6}\)\s*$', ''))
  where name ~ '\(#?[0-9A-Fa-f]{6}\)\s*$';

-- 3) Cliente: CNPJ e Razão Social como campos próprios (ER/ERD/relatório)
alter table clients add column if not exists cnpj varchar(18);
alter table clients add column if not exists razao_social varchar(200);

update clients set cnpj = document where type = 'PJ' and cnpj is null;
update clients set razao_social = name where type = 'PJ' and razao_social is null;
