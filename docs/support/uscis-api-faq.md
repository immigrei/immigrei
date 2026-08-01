# "Meu Caso no USCIS" — FAQ de Suporte

Perguntas que usuários provavelmente vão fazer sobre o rastreamento de casos
(`/painel` → "Meu caso no USCIS"), e como responder.

## "Por que não acha meu caso?"

**Causas prováveis:**
1. Número de recibo errado — confira a notificação I-797: são sempre
   3 letras + 10 dígitos (ex: `IOE0123456789`), sem espaços ou traços.
2. Acabou de dar entrada — a USCIS pode levar 24–48h pra indexar um caso
   novo no sistema deles.
3. Erro de digitação comum: letra `O` no lugar do número `0`.

**O que responder:** confirmar o formato, pedir pra tentar de novo em 24h
se foi protocolado recentemente, e sugerir ligar pra USCIS (1-800-375-5283)
se já passou de 2 dias.

## "Diz 'Caso Recebido' há 3 meses — travou?"

Não é erro nosso — é um status real da USCIS. Significa que eles receberam
mas ainda não começaram a processar.

**O que responder:** os prazos variam por tipo de formulário e escritório;
sugerir conferir o "processing times" no site da USCIS pelo tipo de
formulário + centro de serviço. Se passar do prazo informado, dá pra abrir
uma inquiry diretamente com a USCIS.

## "Tentei adicionar meu caso e deu erro"

**Causa provável:** ainda estamos no ambiente de testes (sandbox) da
USCIS, que só responde de segunda a sexta, 7h–20h (horário de Nova York) —
e só pra números de recibo de teste. Isso é temporário, até a USCIS liberar
o acesso de produção.

**O que responder:** tentar de novo em horário comercial (fuso EST); essa
limitação desaparece assim que formos pra produção.

## "O status mudou mas não recebi e-mail"

A verificação automática roda uma vez por semana. Se o status mudou no
domingo, o e-mail normalmente chega até terça de manhã.

**O que responder:** conferir a caixa de spam; pode atualizar manualmente
a qualquer momento clicando em "Atualizar" no card do caso.

## Mensagens de erro explicadas

| O que aparece pro usuário | O que significa | O que fazer |
|---|---|---|
| "Número de recibo inválido" | Formato errado (não são 3 letras + 10 dígitos) | Pedir pra conferir a I-797 |
| "Caso não encontrado" | USCIS não tem esse recibo (ainda) | Esperar 24–48h ou revisar o formato |
| "Verificação temporariamente indisponível" | Nossa credencial com a USCIS precisa de atenção | Tentar de novo em 5 min; se persistir, escalar |
| "Muitas consultas seguidas" | Limite de 10 consultas / 5 min atingido | Esperar 5 minutos |
| "USCIS temporariamente indisponível" | Fora do horário do sandbox, ou manutenção da USCIS | Tentar em horário comercial (EST) |

## Quando escalar

**Para a USCIS** (developersupport@uscis.dhs.gov):
- Recibo válido mas retorna 404 depois de 48h
- Mesmo recibo mostrando status diferentes em consultas diferentes
- Erros 500 sistemáticos (indica instabilidade do lado da USCIS)

**Para o time técnico (César):**
- Erros de autenticação (401/403) recorrentes
- Rate limit sendo atingido com frequência incomum
- Qualquer alerta do Sentry relacionado à API da USCIS
