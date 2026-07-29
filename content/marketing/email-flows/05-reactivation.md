# Fluxo 05 — Reativação

**Tipo:** MARKETING — exige consentimento e unsubscribe.
**Objetivo:** trazer de volta quem sumiu mas ainda tem caso pendente.
**Premissa:** imigração tem ciclos longos. Alguém que sumiu há 60 dias não
perdeu o interesse — provavelmente está esperando, e o caso continua andando
sem ela olhar. Isso torna a reativação aqui mais promissora que na média de SaaS.

> 🚫 **Bloqueado por schema.** Ver seção abaixo — não dá para construir este
> fluxo hoje.

Status: `RASCUNHO — bloqueado`

---

## O bloqueio

O gatilho natural é "não acessa há ≥30 dias". **Não existe registro de último
acesso em lugar nenhum do banco** — confirmado em 28/07/2026: `profiles` tem 17
colunas e nenhuma é `last_seen_at`, `last_login_at` ou equivalente.

Três saídas, em ordem de preferência:

**A. PostHog como fonte da verdade (recomendado).**
O PostHog já registra sessão desde 27/07. Consultar por lá evita coluna nova e
escrita a cada request. Limitação: só enxerga de 27/07 em diante, então o fluxo
só fica confiável ~30 dias depois disso.

**B. Coluna `last_seen_at` em `profiles`.**
Precisa de update a cada acesso autenticado — escrita no banco em toda
navegação, ou um throttle (só atualiza se passou >1h). Mais controle, mais custo.

**C. Proxy fraco com o que já existe.**
`user_cases.last_checked_at` é do cron, não da pessoa — não serve.
`profiles.updated_at` só muda quando o perfil muda — não serve.
**Nenhum proxy atual funciona.** Não usar.

Recomendação: **A**, e revisitar em setembro quando houver 30 dias de dados.

---

## Gatilho (quando desbloquear)

Segmento: sem sessão há ≥30 dias **e** com caso ativo ainda pendente.

```sql
-- Parte de banco do segmento: casos ativos que não estão concluídos.
-- A condição de "não acessa há 30 dias" vem do PostHog e é cruzada por
-- clerk_user_id — este SELECT sozinho NÃO define o segmento.
select p.clerk_user_id, p.email, p.full_name, p.visa_type,
       c.receipt_number, c.last_status, c.last_status_date,
       s.status as subscription_status
from profiles p
join user_cases c
  on c.user_id = p.clerk_user_id
 and c.is_active = true
left join subscriptions s on s.user_id = p.clerk_user_id
where p.email is not null
  and c.last_status is not null
  -- fora quem já teve desfecho: sem final, não há por que chamar de volta
  and c.last_status not ilike '%approved%'
  and c.last_status not ilike '%denied%'
  and c.last_status not ilike '%card was%';
```

> Os `not ilike` acima são heurística sobre o texto cru do USCIS. Antes de
> produção, cruzar com `lib/uscis-status-pt.ts`, que já classifica status —
> usar a classificação de lá em vez de casar string.

---

## Sequência

**Um e-mail. Só um.** Quem sumiu há um mês e ignora o primeiro contato não
volta com o segundo — volta com irritação e descadastro.

**Assunto A:** `📬 Seu caso andou enquanto você esteve fora` (43 char)
**Assunto B:** `📬 Faz um tempo. Seu caso continua aqui` (39 char)
**Preview:** `Um resumo do que mudou desde a sua última visita.`

Princípio: **liderar com informação real do caso dela**, não com "sentimos sua
falta". O valor precisa estar no corpo do e-mail, não atrás de um clique.

```html
<h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 14px;line-height:1.3;">
  Enquanto você esteve fora
</h1>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 20px;">
  Faz um tempo que você não abre a Immigrei — mas a gente continuou
  acompanhando seu caso.
</p>

<div style="background:#FBF7EF;border:1px solid #E4EFE9;border-radius:16px;padding:22px;margin:0 0 24px;">
  <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#8B958F;margin:0 0 10px;">
    {{receipt_number}}
  </p>
  <p style="font-size:17px;font-weight:600;color:#1B2520;margin:0 0 6px;">
    {{status_traduzido}}
  </p>
  <p style="font-size:14px;line-height:1.6;color:#55615A;margin:0;">
    Última movimentação em {{status_date}}.
  </p>
</div>

<p style="font-size:16px;line-height:1.6;color:#55615A;margin:0 0 26px;">
  Se quiser retomar de onde parou, seu painel está do jeito que você deixou.
</p>

<a href="{{APP_URL}}/painel"
   style="display:inline-block;background:#1E5E4E;color:#F4EEE2;font-weight:700;font-size:16px;text-decoration:none;padding:15px 30px;border-radius:12px;">
  Ver meu painel →
</a>

<p style="font-size:13px;line-height:1.6;color:#8B958F;margin:26px 0 0;">
  Se a sua jornada mudou de rumo e a Immigrei não faz mais sentido, você pode
  <a href="{{UNSUBSCRIBE_URL}}" style="color:#8B958F;">sair da lista aqui</a>.
  Sem ressentimento — boa sorte de verdade.
</p>
```

Aquele último parágrafo é intencional: quem não vai voltar sai limpo, e o
resto da lista fica mais saudável. Segurar endereço morto derruba a entrega dos
e-mails que importam.

---

## Condições de saída

- Abriu o app → sai imediatamente.
- Descadastrou.
- Caso chegou a desfecho (aprovado, negado, green card emitido) — nesse caso,
  se um dia existir, cabe um fluxo próprio de encerramento, não este.
- Já recebeu → não reentra por 180 dias.

## Métricas

| Métrica | Alvo | Como medir |
|---|---|---|
| Abertura | ≥35% | Resend |
| Retorno ao app em 7 dias | ≥8% | PostHog, sessão por `clerk_user_id` |
| Descadastro | <3% | Resend |
| Reassinatura (ex-pagantes) | acompanhar | `subscriptions` |

Descadastro alto aqui não é fracasso — é higiene de lista. O número a vigiar é
reclamação de spam: acima de 0,1% compromete o domínio inteiro.

## Implementação

Bloqueado. Ordem para desbloquear:

1. Decidir entre PostHog (A) e coluna nova (B).
2. Migration de consentimento aplicada + unsubscribe funcionando.
3. Separação de subdomínio de marketing — este é o fluxo com maior risco de
   reclamação, e não deve sair do mesmo domínio dos alertas de status.
4. Cron `app/api/cron/reactivation`, semanal (não diário).
5. `sendReactivation` em `lib/notifications.ts`, stream de marketing.
