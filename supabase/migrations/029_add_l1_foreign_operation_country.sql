-- L-1 anteriormente assumia que o país da operação estrangeira qualificada
-- era sempre o Brasil, depois foi trocado por "país de residência" — os dois
-- estavam errados: o L-1 é sobre onde a EMPRESA opera, não onde a pessoa
-- mora. Agora é um campo aberto e explícito.
alter table profiles add column if not exists l1_foreign_operation_country text;
