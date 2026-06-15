-- Preço por item da OS (lançado no perfil do cliente, por peça)
alter table order_items add column if not exists price varchar(100);

-- Referência para o anexo que será usado como imagem na ficha técnica
alter table orders add column if not exists image_attachment_id bigint
  references order_attachments(id) on delete set null;
