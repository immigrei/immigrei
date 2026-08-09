/**
 * Email notifications via Resend
 * Used by cron jobs to alert users of case status changes.
 */

import { Resend } from "resend";
import { traduzirStatus } from "./uscis-status-pt";
import { todosVistos } from "./vistosCatalog";
import { PLANS } from "./stripe";

// Resend sandbox sender until immigrei.com is verified — set EMAIL_FROM
// in Vercel to "immigrei <noreply@immigrei.com>" after domain verification.
const FROM = process.env.EMAIL_FROM ?? "immigrei <onboarding@resend.dev>";
// Canonical app URL for email links — set NEXT_PUBLIC_APP_URL in Vercel to
// https://immigrei.app once the domain is live.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://immigrei.vercel.app";
function getResend() { return new Resend(process.env.RESEND_API_KEY); }

// ── Case status changed ────────────────────────────────────────────────────

export async function sendCaseStatusUpdate({
  to,
  userName,
  receiptNumber,
  visaType,
  label,
  oldStatus,
  newStatus,
  statusDate,
  description,
  isApproved,
  isDenied,
}: {
  to:            string;
  userName:      string;
  receiptNumber: string;
  visaType?:     string;
  label?:        string;
  oldStatus:     string;
  newStatus:     string;
  statusDate:    string;
  description:   string;
  isApproved:    boolean;
  isDenied:      boolean;
}) {
  const caseName = label ?? visaType ?? receiptNumber;
  const emoji    = isApproved ? "✅" : isDenied ? "❌" : "📋";
  const antigo   = traduzirStatus(oldStatus);
  const novo     = traduzirStatus(newStatus);
  const subject  = `${emoji} ${novo.titulo} — caso ${caseName} | immigrei`;

  const statusColor = isApproved ? "#1E5E4E" : isDenied ? "#C2542F" : "#E8A33D";
  const statusBg    = isApproved ? "#E4EFE9" : isDenied ? "rgba(194,84,47,.08)" : "#FBEDD4";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <!-- Card -->
    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#8B958F;margin:0 0 12px;">
        Atualização de caso
      </p>
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        Seu caso foi atualizado
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 28px;">
        Olá${userName ? ", " + userName : ""}! Detectamos uma mudança no seu caso <strong>${caseName}</strong>.
      </p>

      <!-- Receipt number -->
      <div style="background:#F4EEE2;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8B958F;">
          Número de recibo
        </span><br>
        <span style="font-size:15px;font-weight:600;color:#1B2520;font-family:monospace;">
          ${receiptNumber}
        </span>
      </div>

      <!-- Status change -->
      <div style="margin-bottom:20px;">
        <div style="font-size:12px;color:#8B958F;margin-bottom:6px;">Status anterior</div>
        <div style="font-size:14px;color:#8B958F;text-decoration:line-through;padding:10px 14px;background:#F4EEE2;border-radius:8px;">
          ${antigo.titulo}
        </div>
      </div>
      <div style="margin-bottom:24px;">
        <div style="font-size:12px;color:#8B958F;margin-bottom:6px;">Novo status ${statusDate ? "— " + statusDate : ""}</div>
        <div style="font-size:15px;font-weight:700;color:${statusColor};padding:12px 16px;background:${statusBg};border-radius:10px;border:1px solid ${statusColor}33;">
          ${novo.titulo}
        </div>
        <div style="font-size:12px;color:#8B958F;margin-top:6px;">
          Status oficial (USCIS): ${newStatus}
        </div>
      </div>

      <!-- O que isso significa -->
      <div style="font-size:14px;color:#1B2520;line-height:1.65;padding:14px 16px;background:#E4EFE9;border-radius:10px;margin-bottom:${description ? "12px" : "24px"};">
        <strong>O que isso significa:</strong> ${novo.explicacao}
      </div>

      <!-- Description (original USCIS text) -->
      ${description ? `
      <div style="font-size:13px;color:#55615A;line-height:1.65;padding:14px 16px;background:#F4EEE2;border-radius:10px;margin-bottom:24px;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8B958F;">Texto original do USCIS</span><br>
        ${description}
      </div>` : ""}

      <!-- CTA -->
      <a href="${APP_URL}/dashboard"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
        Ver minha jornada →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Informações extraídas diretamente do <strong>USCIS</strong> (uscis.gov).</p>
      <p style="margin:6px 0 0">Não compartilhamos seus dados com terceiros.</p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── I-94 deadline approaching ────────────────────────────────────────────

export async function sendI94DeadlineAlert({
  to,
  userName,
  daysLeft,
  i94ExpiryDate,
}: {
  to:            string;
  userName:      string;
  daysLeft:      number;
  i94ExpiryDate: string; // "YYYY-MM-DD"
}) {
  const vencido = daysLeft < 0;
  const hoje    = daysLeft === 0;

  const emoji = vencido ? "🚨" : daysLeft <= 7 ? "⏰" : "📅";
  const subject = vencido
    ? `${emoji} Seu I-94 venceu — immigrei`
    : hoje
      ? `${emoji} Seu I-94 vence hoje — immigrei`
      : `${emoji} Faltam ${daysLeft} dia${daysLeft === 1 ? "" : "s"} para o seu I-94 vencer — immigrei`;

  const statusColor = vencido ? "#C2542F" : daysLeft <= 7 ? "#E8A33D" : "#1E5E4E";
  const statusBg    = vencido ? "rgba(194,84,47,.08)" : daysLeft <= 7 ? "#FBEDD4" : "#E4EFE9";
  const [y, m, d] = i94ExpiryDate.split("-");
  const dataFormatada = `${d}/${m}/${y}`;

  const mensagem = vencido
    ? `Seu I-94 (o comprovante da sua entrada nos EUA) venceu há ${Math.abs(daysLeft)} dia${Math.abs(daysLeft) === 1 ? "" : "s"} (${dataFormatada}). Isso já conta como presença irregular — quanto antes você agir, mais opções ficam abertas.`
    : hoje
      ? `Seu I-94 (o comprovante da sua entrada nos EUA) vence hoje (${dataFormatada}). Se uma extensão ou mudança de status ainda não foi protocolada, este é o último dia para isso acontecer em status válido.`
      : `Seu I-94 (o comprovante da sua entrada nos EUA) vence em ${dataFormatada} — faltam ${daysLeft} dia${daysLeft === 1 ? "" : "s"}. Extensão (I-539) ou mudança de status precisam ser protocoladas antes do vencimento, não depois.`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#8B958F;margin:0 0 12px;">
        Prazo do I-94
      </p>
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        ${vencido ? "Seu I-94 venceu" : hoje ? "Seu I-94 vence hoje" : `Faltam ${daysLeft} dia${daysLeft === 1 ? "" : "s"}`}
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 24px;">
        Olá${userName ? ", " + userName : ""}!
      </p>

      <div style="padding:14px 16px;background:${statusBg};border-radius:10px;border:1px solid ${statusColor}33;margin-bottom:20px;">
        <p style="font-size:15px;font-weight:600;color:${statusColor};margin:0;line-height:1.5;">
          ${mensagem}
        </p>
      </div>

      <div style="background:#F4EEE2;border-radius:10px;padding:12px 16px;margin-bottom:24px;">
        <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8B958F;">
          Data do seu I-94
        </span><br>
        <span style="font-size:15px;font-weight:600;color:#1B2520;">
          ${dataFormatada}
        </span>
      </div>

      <a href="${APP_URL}/dashboard"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
        Ver minha jornada →
      </a>
    </div>

    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">A data do I-94 é a que você mesmo cadastrou no immigrei — confirme em <strong>i94.cbp.dhs.gov</strong> se tiver dúvida.</p>
      <p style="margin:6px 0 0">Não somos um escritório de advocacia. Para decisões, consulte um profissional.</p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── I-94 field left blank ────────────────────────────────────────────────

export async function sendI94ReminderToFillIn({
  to,
  userName,
}: {
  to:       string;
  userName: string;
}) {
  const subject = "📅 Adicione o prazo do seu I-94 — immigrei";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#8B958F;margin:0 0 12px;">
        Prazo do I-94
      </p>
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        Ainda não sabemos seu prazo de permanência
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 24px;">
        Olá${userName ? ", " + userName : ""}!
      </p>

      <div style="padding:14px 16px;background:#E4EFE9;border-radius:10px;border:1px solid #1E5E4E33;margin-bottom:24px;">
        <p style="font-size:15px;font-weight:600;color:#1E5E4E;margin:0;line-height:1.5;">
          A data que realmente define até quando você pode ficar nos EUA é a do I-94 (o comprovante da sua entrada no país) — não a validade do visto no passaporte. Sem ela, não conseguimos te avisar antes do vencimento.
        </p>
      </div>

      <a href="${APP_URL}/dashboard"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
        Adicionar meu prazo do I-94 →
      </a>
    </div>

    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Confira sua data em <strong>i94.cbp.dhs.gov</strong> — leva 2 minutos.</p>
      <p style="margin:6px 0 0">Não somos um escritório de advocacia. Para decisões, consulte um profissional.</p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── Visa Bulletin updated ──────────────────────────────────────────────────

export async function sendBulletinUpdate({
  to,
  userName,
  bulletinMonth,
  bulletinUrl,
  summary,
}: {
  to:           string;
  userName:     string;
  bulletinMonth: string;
  bulletinUrl:  string;
  summary:      string;
}) {
  const subject = `📅 Novo Visa Bulletin disponível — ${bulletinMonth}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>
    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#8B958F;margin:0 0 12px;">
        Visa Bulletin — ${bulletinMonth}
      </p>
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 16px;">
        Novo boletim de vistos publicado
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 20px;line-height:1.6;">
        Olá${userName ? ", " + userName : ""}! O Dept. of State publicou o Visa Bulletin de <strong>${bulletinMonth}</strong>.
        Ele define as datas de prioridade para vistos de imigrante.
      </p>
      <div style="font-size:14px;color:#55615A;line-height:1.65;padding:14px 16px;background:#F4EEE2;border-radius:10px;margin-bottom:24px;">
        ${summary}
      </div>
      <a href="${bulletinUrl}" target="_blank"
         style="display:block;background:#E8A33D;color:#1B2520;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;margin-bottom:12px;">
        Ver boletim oficial →
      </a>
      <a href="${APP_URL}/dashboard"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
        Ver minha jornada →
      </a>
    </div>
    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Fonte oficial: <strong>travel.state.gov</strong> (Dept. of State / NVC)</p>
    </div>
  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── Consulate itinerant alert ──────────────────────────────────────────────

type ConsuladoEventBasic = {
  consulado:   string;
  titulo:      string;
  descricao:   string;
  data_inicio: string | null;
  data_fim:    string | null;
  cidade:      string | null;
  estado:      string | null;
  servicos:    string[];
  url_fonte:   string;
};

const CONSULADO_NAMES: Record<string, string> = {
  miami: "Consulado-Geral de Miami",
  nyc:   "Consulado-Geral de Nova York",
};

export async function sendConsuladoAlert({
  to,
  userName,
  events,
}: {
  to:        string;
  userName:  string;
  events:    ConsuladoEventBasic[];
}) {
  const subject = `🇧🇷 Novos atendimentos consulares — immigrei`;

  const eventsHtml = events.map(e => {
    const consuladoNome = CONSULADO_NAMES[e.consulado] ?? e.consulado;
    const local = [e.cidade, e.estado].filter(Boolean).join(", ") || "Ver detalhes";
    const datas = e.data_inicio
      ? `${formatDatePT(e.data_inicio)}${e.data_fim && e.data_fim !== e.data_inicio ? ` até ${formatDatePT(e.data_fim)}` : ""}`
      : "Data a confirmar";
    const servicos = e.servicos.length > 0 ? e.servicos.join(" · ") : "";

    return `
    <div style="background:#F4EEE2;border-radius:14px;padding:20px;margin-bottom:16px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8B958F;margin-bottom:6px;">
        ${consuladoNome}
      </div>
      <div style="font-size:16px;font-weight:700;color:#1B2520;margin-bottom:8px;">${e.titulo}</div>
      <div style="font-size:13px;color:#55615A;margin-bottom:10px;line-height:1.5;">${e.descricao.slice(0, 200)}${e.descricao.length > 200 ? "..." : ""}</div>
      <div style="margin-bottom:10px;">
        <span style="background:#E4EFE9;color:#1E5E4E;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;margin-right:6px;">📅 ${datas}</span>
        <span style="background:#E4EFE9;color:#1E5E4E;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;">📍 ${local}</span>
      </div>
      ${servicos ? `<div style="font-size:12px;color:#55615A;">${servicos}</div>` : ""}
      <a href="${e.url_fonte}" target="_blank"
         style="display:inline-block;margin-top:12px;font-size:13px;color:#1E5E4E;font-weight:700;text-decoration:underline;">
        Ver no site do consulado →
      </a>
    </div>`;
  }).join("");

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>
    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#8B958F;margin:0 0 12px;">
        Consulados Brasileiros
      </p>
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        Novos atendimentos disponíveis
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 24px;line-height:1.6;">
        Olá${userName ? ", " + userName : ""}! Encontramos ${events.length === 1 ? "um novo atendimento" : `${events.length} novos atendimentos`} nos consulados brasileiros que você acompanha.
      </p>
      ${eventsHtml}
      <a href="${APP_URL}/consulados"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;margin-top:8px;">
        Ver todos os atendimentos →
      </a>
    </div>
    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Dados extraídos dos sites oficiais dos Consulados-Gerais do Brasil.</p>
      <p style="margin:6px 0 0">
        Para cancelar os alertas, acesse suas
        <a href="${APP_URL}/dashboard" style="color:#8B958F;">preferências no immigrei</a>.
      </p>
    </div>
  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── Waitlist welcome ───────────────────────────────────────────────────────

export async function sendWaitlistWelcome(to: string) {
  const shareText = encodeURIComponent(
    "Achei um app que vai mostrar a jornada de imigração nos EUA inteira em português — feito por brasileiros. Entra na lista de espera: https://immigrei.app",
  );
  const subject = "Você está na lista 💚 — immigrei";

  const item = (emoji: string, title: string, text: string) =>
    `<p style="font-size:15px;color:#55615A;line-height:1.7;margin:0 0 6px;">${emoji}&nbsp; <strong style="color:#1B2520;">${title}</strong> — ${text}</p>`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 16px;line-height:1.25;">
        Você está dentro. 💚
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 16px;line-height:1.65;">
        O USCIS está com <strong style="color:#1B2520;">mais de 11 milhões de casos parados</strong>
        — o maior acúmulo em uma década. Se o seu é um deles, você conhece a
        rotina: o site diz &ldquo;caso recebido&rdquo; e some. O Google se
        contradiz. E entender o básico custa US$ 300 numa ligação de 15 minutos
        com advogado — que muitas vezes termina com mais dúvidas do que começou.
      </p>
      <p style="font-size:15px;color:#1B2520;font-weight:600;margin:0 0 12px;">
        A immigrei está sendo construída para acabar com isso. No app, você vai ter:
      </p>
      ${item("🔔", "Seu caso monitorado dia e noite", "a gente fica de olho no USCIS e te avisa na hora que algo mudar. Chega de abrir o site toda manhã para ver a mesma tela.")}
      ${item("🧭", "Os caminhos possíveis a partir de onde você está", "com os requisitos claros de cada um. Mesmo que ainda não dê para avançar hoje, você sai sabendo exatamente o que construir para chegar lá.")}
      ${item("📋", "Kits passo a passo do seu visto", "documentos, prazos, taxas e cada formulário explicado em português. Inclusive os detalhes que ninguém conta e que causam negação.")}
      ${item("🗂️", "Seus documentos em um lugar só", "passaporte, recibos, formulários: guardados, organizados e à mão quando pedirem")}
      ${item("📅", "Radar de datas e eventos", "o visa bulletin do mês explicado e os consulados itinerantes perto de você")}
      <p style="font-size:15px;color:#55615A;line-height:1.7;margin:0 0 16px;">🤝&nbsp; <strong style="color:#1B2520;">E quando o caso pedir julgamento humano</strong> — aquelas decisões com subjetividade que só um especialista pode avaliar — conectamos você a profissionais verificados, sem sair do app. A immigrei segue organizando tudo; o especialista entra na hora certa.</p>
      <p style="font-size:15px;color:#55615A;margin:0 0 24px;line-height:1.65;">
        Quem constrói somos nós: dois amigos brasileiros — um imigrou para a
        Austrália, o outro para os EUA. Vivemos essa incerteza na pele — por
        isso quem está na lista entra primeiro, com acesso antecipado.
      </p>

      <a href="https://immigrei.app/nossa-historia"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;margin-bottom:10px;">
        Conhecer a nossa história →
      </a>
      <a href="https://wa.me/?text=${shareText}"
         style="display:block;background:transparent;color:#1E5E4E;border:2px solid #1E5E4E;text-align:center;padding:14px;border-radius:14px;text-decoration:none;font-size:15px;font-weight:700;">
        Indicar para alguém no WhatsApp
      </a>
    </div>

    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Não somos um escritório de advocacia. Não compartilhamos seus dados com terceiros.</p>
      <p style="margin:6px 0 0"><a href="https://immigrei.app/nossa-historia" style="color:#8B958F;">Leia a nossa história</a></p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── Subscription confirmed (checkout completed) ─────────────────────────────

export async function sendSubscriptionConfirmed({
  to,
  userName,
  planName,
  isAnnual,
  amountFormatted,
  currentPeriodEndFormatted,
  invoiceUrl,
}: {
  to:                        string;
  userName:                  string;
  planName:                  string;
  isAnnual:                  boolean;
  amountFormatted:           string;
  currentPeriodEndFormatted: string;
  invoiceUrl?:               string;
}) {
  const subject = "✅ Sua Jornada está ativa";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        Sua Jornada está ativa
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 24px;">
        Olá${userName ? ", " + userName : ""}! A cobrança da sua assinatura foi aprovada — a partir de agora você tem acesso completo.
      </p>

      <div style="background:#E4EFE9;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
        <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
          immigrei ${planName} — ${isAnnual ? "anual" : "mensal"}
        </p>
        <p style="font-size:14px;color:#55615A;margin:0;">
          ${amountFormatted} · próxima cobrança em ${currentPeriodEndFormatted}
        </p>
      </div>

      <p style="font-size:14px;color:#55615A;line-height:1.6;margin:0 0 24px;">
        A partir de agora sua jornada mostra não só onde você está, mas o que vem depois e o que fazer em cada passo — kits completos, documentos organizados num só lugar e alertas automáticos do seu caso.
      </p>

      <a href="${APP_URL}/dashboard"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;margin-bottom:12px;">
        Ver minha jornada →
      </a>
      ${invoiceUrl ? `
      <a href="${invoiceUrl}" target="_blank"
         style="display:block;background:transparent;color:#8B958F;text-align:center;padding:8px;text-decoration:underline;font-size:13px;">
        Ver recibo desta cobrança
      </a>` : ""}
    </div>

    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Não somos um escritório de advocacia. Não compartilhamos seus dados com terceiros.</p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── Retention nudge (sent alongside the cancellation-confirmed receipt) ────
// Not the full flow 07 (no discount, no in-app screen, no DB record) — just
// the two value-adds that don't need a "Gate humano" approval per
// content/marketing/email-flows/07-retencao-cancelamento.md: the public
// annual-price math (motive "price", rota a) and a concrete reminder of
// what's tied to the account (motive "resolved"/"not_using"). Kept as its
// own email, not folded into flow 08, because 08 is a "recibo" (README.md
// §1.2) and stuffing an offer under a confirmation is the exact risk that
// bucket calls out.

export async function sendRetentionNudge({
  to,
  userName,
  accessUntilFormatted,
  planId,
  visaType,
}: {
  to:                    string;
  userName:              string;
  accessUntilFormatted:  string;
  planId:                "monthly" | "annual";
  visaType?:             string | null;
}) {
  const subject = "Antes de você ir — uma coisa que pode ajudar";

  const vistoNome = visaType ? todosVistos.find((v) => v.id === visaType)?.nome : null;

  const annualBlock = planId === "monthly" ? `
      <div style="padding:16px;background:#E4EFE9;border-radius:10px;border:1px solid #1E5E4E33;margin-bottom:20px;">
        <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
          Se o motivo foi o preço: o plano anual sai ~25% mais barato
        </p>
        <p style="font-size:14px;color:#55615A;margin:0;line-height:1.6;">
          $${PLANS.monthly.amount.toFixed(2)}/mês × 12 = $${(PLANS.monthly.amount * 12).toFixed(2)}/ano no mensal,
          contra $${PLANS.annual.amount.toFixed(2)}/ano no anual — sem cupom, é o preço que já está no ar.
          Dá pra trocar de ciclo em vez de cancelar, e sua assinatura não é interrompida em nenhum momento.
        </p>
      </div>` : "";

  const contextLine = vistoNome
    ? `O caminho do seu visto (${vistoNome}) e os documentos que você já organizou continuam exatamente onde você parou.`
    : "Sua jornada e os documentos que você já organizou continuam exatamente onde você parou.";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <h1 style="font-size:24px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        Antes de você ir
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 20px;line-height:1.6;">
        Olá${userName ? ", " + userName : ""}. ${contextLine} Você ainda tem acesso até ${accessUntilFormatted} — dá tempo de mudar de ideia sem perder nada.
      </p>

      ${annualBlock}

      <a href="${APP_URL}/perfil"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;margin-bottom:12px;">
        Reativar ou trocar de plano →
      </a>
      <a href="${APP_URL}/profissionais"
         style="display:block;text-align:center;padding:4px;color:#55615A;text-decoration:underline;font-size:13px;">
        Prefere seguir com um profissional? Veja a rede verificada
      </a>
    </div>

    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Não somos um escritório de advocacia. Não compartilhamos seus dados com terceiros.</p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── Subscription cancellation confirmed (cancel_at_period_end flip) ────────

export async function sendSubscriptionCancelled({
  to,
  userName,
  accessUntilFormatted,
}: {
  to:                    string;
  userName:              string;
  accessUntilFormatted:  string;
}) {
  const subject = "Cancelamento confirmado — immigrei";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        Cancelamento recebido
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 24px;">
        Olá${userName ? ", " + userName : ""}. Confirmamos o cancelamento da sua assinatura — não vai haver nenhuma nova cobrança.
      </p>

      <div style="padding:14px 16px;background:#FBEDD4;border-radius:10px;border:1px solid #E8A33D33;margin-bottom:20px;">
        <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
          Seu acesso continua até ${accessUntilFormatted}
        </p>
        <p style="font-size:14px;color:#55615A;margin:0;line-height:1.5;">
          Até lá, sua jornada, seus kits e seu cofre de documentos seguem funcionando normalmente.
        </p>
      </div>

      <p style="font-size:14px;color:#55615A;line-height:1.6;margin:0 0 24px;">
        Mudou de ideia? Você pode reativar a qualquer momento antes de ${accessUntilFormatted} sem perder nada do que já organizou.
      </p>

      <a href="${APP_URL}/perfil"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
        Gerenciar minha assinatura →
      </a>
    </div>

    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Não somos um escritório de advocacia. Não compartilhamos seus dados com terceiros.</p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── Billing cycle changed (monthly ↔ annual) ────────────────────────────────

export async function sendPlanCycleChanged({
  to,
  userName,
  fromCycleLabel,
  toCycleLabel,
  newAmountFormatted,
  currentPeriodEndFormatted,
  switchedToAnnual,
  invoiceUrl,
}: {
  to:                         string;
  userName:                   string;
  fromCycleLabel:             string;
  toCycleLabel:               string;
  newAmountFormatted:         string;
  currentPeriodEndFormatted:  string;
  switchedToAnnual:           boolean;
  invoiceUrl?:                string;
}) {
  const subject = switchedToAnnual
    ? "✅ Você trocou para o plano anual"
    : "Sua assinatura agora é mensal";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        Troca de ciclo confirmada
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 24px;">
        Olá${userName ? ", " + userName : ""}! Sua assinatura da Jornada mudou de ${fromCycleLabel} para ${toCycleLabel}. Nada muda no acesso — só a forma de cobrança.
      </p>

      <div style="background:#E4EFE9;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
        <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
          immigrei Jornada — ${toCycleLabel}
        </p>
        <p style="font-size:14px;color:#55615A;margin:0;">
          ${newAmountFormatted} · próxima cobrança em ${currentPeriodEndFormatted}
        </p>
      </div>

      ${switchedToAnnual ? `
      <div style="background:#FBEDD4;border-radius:10px;padding:14px 16px;margin:0 0 24px;">
        <p style="font-size:14px;line-height:1.6;color:#55615A;margin:0;">
          No anual, os US$ 269 equivalem a 9 meses do preço mensal — a economia já está aplicada na cobrança acima, nenhuma ação extra necessária.
        </p>
      </div>` : ""}

      <a href="${APP_URL}/dashboard"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;margin-bottom:12px;">
        Ver minha jornada →
      </a>
      ${invoiceUrl ? `
      <a href="${invoiceUrl}" target="_blank"
         style="display:block;background:transparent;color:#8B958F;text-align:center;padding:8px;text-decoration:underline;font-size:13px;">
        Ver detalhes da cobrança
      </a>` : ""}
    </div>

    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Não somos um escritório de advocacia. Não compartilhamos seus dados com terceiros.</p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── Access ended (customer.subscription.deleted) ────────────────────────────

export async function sendAccessEnded({
  to,
  userName,
  caseReceipt,
}: {
  to:           string;
  userName:     string;
  caseReceipt?: string;
}) {
  const subject = "Você voltou para o Retrato";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        Você está no Retrato agora
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 24px;">
        Olá${userName ? ", " + userName : ""}. Sua assinatura da Jornada terminou — mas sua conta continua ativa, no plano gratuito.
      </p>

      <div style="background:#E4EFE9;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
        <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
          O que continua com você, sem custo
        </p>
        <p style="font-size:14px;line-height:1.6;color:#55615A;margin:0;">
          Seu caso ${caseReceipt ? `<strong style="color:#1B2520;">${caseReceipt}</strong>` : ""} segue sendo acompanhado e você continua recebendo os alertas de status. Seus documentos continuam guardados no cofre — só o upload de novos é que fica pausado.
        </p>
      </div>

      <div style="background:#F4EEE2;border-radius:10px;padding:14px 16px;margin:0 0 24px;">
        <p style="font-size:12px;color:#8B958F;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">O que fica para trás</p>
        <p style="font-size:14px;line-height:1.6;color:#55615A;margin:0;">
          A leitura do que cada mudança de status significa, os kits de protocolo passo a passo e o acesso completo ao cofre de documentos.
        </p>
      </div>

      <a href="${APP_URL}/planos"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
        Ver a Jornada de novo →
      </a>
    </div>

    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Não somos um escritório de advocacia. Não compartilhamos seus dados com terceiros.</p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

// ── Subscription reactivated (cancel_at_period_end true → false) ───────────

export async function sendSubscriptionReactivated({
  to,
  userName,
  currentPeriodEndFormatted,
}: {
  to:                        string;
  userName:                  string;
  currentPeriodEndFormatted: string;
}) {
  const subject = "Bem-vinda de volta à Jornada";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4EEE2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <img src="${APP_URL}/brand/immigrei-icone-verde.svg" width="26" height="26" alt="" style="vertical-align:middle;margin-right:8px;">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;vertical-align:middle;">immigrei</span>
    </div>

    <div style="background:#FBF7EF;border-radius:20px;padding:32px;border:1px solid #E4EFE9;">
      <h1 style="font-size:26px;font-weight:600;color:#1B2520;margin:0 0 8px;line-height:1.2;">
        Que bom que você ficou
      </h1>
      <p style="font-size:15px;color:#55615A;margin:0 0 24px;">
        Olá${userName ? ", " + userName : ""}! Sua assinatura da Jornada foi reativada — o cancelamento não vai mais acontecer.
      </p>

      <div style="background:#E4EFE9;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
        <p style="font-size:15px;font-weight:700;color:#164A3D;margin:0 0 4px;">
          Nada foi perdido
        </p>
        <p style="font-size:14px;color:#55615A;margin:0;line-height:1.5;">
          Seu histórico, seus documentos e seu progresso no checklist continuam exatamente do jeito que você deixou. Próxima cobrança em ${currentPeriodEndFormatted}.
        </p>
      </div>

      <a href="${APP_URL}/dashboard"
         style="display:block;background:#1E5E4E;color:#FBF7EF;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-size:16px;font-weight:700;">
        Ver minha jornada →
      </a>
    </div>

    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#8B958F;line-height:1.6;">
      <p style="margin:0">Não somos um escritório de advocacia. Não compartilhamos seus dados com terceiros.</p>
    </div>

  </div>
</body>
</html>`;

  await getResend().emails.send({ from: FROM, to, subject, html });
}

function formatDatePT(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}
