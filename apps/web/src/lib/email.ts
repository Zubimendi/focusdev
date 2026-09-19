/**
 * Email helper — Resend when RESEND_API_KEY is set; otherwise logs the payload in dev.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ sent: boolean; mode: "resend" | "dev-log" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "FocusDev <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(
      `[email:dev] to=${opts.to} subject=${opts.subject}\n${opts.text || opts.html}`
    );
    return { sent: false, mode: "dev-log" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[email] Resend failed ${res.status}: ${body}`);
    throw new Error("Failed to send email");
  }

  return { sent: true, mode: "resend" };
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px; color: #1c2421;">Reset your FocusDev password</h1>
      <p style="color: #4a5550; line-height: 1.5;">
        Click the button below to choose a new password. This link expires in 1 hour.
      </p>
      <p style="margin: 28px 0;">
        <a href="${resetUrl}"
           style="background:#2d6a5e;color:#f7faf8;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          Reset password
        </a>
      </p>
      <p style="color:#8a9691;font-size:13px;">If you didn’t ask for this, you can ignore this email.</p>
    </div>
  `;
}
