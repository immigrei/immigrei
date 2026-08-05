-- Allow documents in the vault that aren't tied to a checklist clip: the
-- user can add a file directly under a category tab in /documentos/cofre
-- (Identidade, Financeiro, Tradução, Formulários, Acadêmico/Profissional)
-- instead of only through a visto's checklist item. Clip-based uploads are
-- unchanged and keep being categorized client-side by lib/document-category.ts.
alter table user_documents
  alter column visto_id drop not null,
  alter column documento_id drop not null,
  add column if not exists categoria text,
  add column if not exists titulo text;

alter table user_documents
  add constraint user_documents_origin_check check (
    (visto_id is not null and documento_id is not null and categoria is null and titulo is null)
    or
    (visto_id is null and documento_id is null and categoria is not null and titulo is not null)
  );

alter table user_documents
  add constraint user_documents_categoria_check check (
    categoria is null or categoria in ('Identidade', 'Financeiro', 'Tradução', 'Formulários', 'Acadêmico/Profissional')
  );
