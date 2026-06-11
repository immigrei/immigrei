/**
 * Email notifications via Resend
 * Used by cron jobs to alert users of case status changes.
 */

import { Resend } from "resend";

const FROM = "Immigrei <noreply@immigrei.com>";
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
  const subject  = `${emoji} Atualização no seu caso ${caseName} — Immigrei`;

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
      <span style="font-size:24px;font-weight:700;color:#1E5E4E;letter-spacing:-.5px;">Immigrei</span>
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
          ${oldStatus}
        </div>
      </div>
      <div style="margin-bottom:24px;">
        <div style="font-size:12px;color:#8B958F;margin-bottom:6px;">Novo status ${statusDate ? "— " + statusDate : ""}</div>
        <div style="font-size:15px;font-weight:700;color:${statusColor};padding:12px 16px;background:${statusBg};border-radius:10px;border:1px solid ${statusColor}33;">
          ${newStatus}
        </div>
      </div>

      <!-- Description -->
      ${description ? `
      <div style="font-size:14px;color:#55615A;line-height:1.65;padding:14px 16px;background:#F4EEE2;border-radius:10px;margin-bottom:24px;">
        ${description}
      </div>` : ""}

      <!-- CTA -->
      <a href="https://immigrei.vercel.app/dashboard"
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
      <span style="font-size:24px;font-weight:700;color:#1E5E4E;">Immigrei</span>
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
      <a href="https://immigrei.vercel.app/dashboard"
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
