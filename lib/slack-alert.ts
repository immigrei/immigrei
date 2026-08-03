// Best-effort Slack notification for background-job failures — the bridge
// between jobs that already run correctly and a team that today only finds
// out something broke when a user complains. No-op (just logs) until
// SLACK_ALERTS_WEBHOOK_URL is set, so this never blocks a cron before the
// webhook exists — see the setup steps handed to César.
export async function notifySlackAlert(text: string) {
  const url = process.env.SLACK_ALERTS_WEBHOOK_URL;
  if (!url) {
    console.warn("[slack-alert] SLACK_ALERTS_WEBHOOK_URL not set — skipping:", text);
    return;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.error("[slack-alert] Slack webhook responded", res.status);
    }
  } catch (err) {
    // Never let a notification failure break the job it's reporting on.
    console.error("[slack-alert] Failed to reach Slack:", err);
  }
}
