import sgMail from "@sendgrid/mail";
import { logger } from "./logger";

const RECIPIENTS = ["quotes@aksantimeds.com", "tembomarkj@gmail.com"];
const FROM_NAME = "Aksantimed";

interface SendGridCreds { apiKey: string; fromEmail: string; }

async function fetchSendGridCreds(): Promise<SendGridCreds | null> {
  // Env var overrides take precedence (production-friendly)
  if (process.env.SENDGRID_API_KEY) {
    return {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || "no-reply@aksantimeds.com",
    };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? `repl ${process.env.REPL_IDENTITY}`
    : process.env.WEB_REPL_RENEWAL
    ? `depl ${process.env.WEB_REPL_RENEWAL}`
    : null;

  if (!hostname || !xReplitToken) return null;

  try {
    const url = `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=sendgrid`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "X-Replit-Token": xReplitToken },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: Array<{ settings?: Record<string, unknown> }> };
    const settings = data.items?.[0]?.settings as Record<string, string> | undefined;
    const apiKey = settings?.api_key || settings?.apiKey;
    const fromEmail = settings?.from_email || settings?.fromEmail || process.env.SENDGRID_FROM_EMAIL || "no-reply@aksantimeds.com";
    if (apiKey) return { apiKey, fromEmail };
    return null;
  } catch (err) {
    logger.warn({ err }, "Could not fetch SendGrid credentials from connector");
    return null;
  }
}

async function sendMail(opts: {
  to: string[];
  subject: string;
  text: string;
  html: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const creds = await fetchSendGridCreds();
  if (!creds) {
    logger.warn(
      { to: opts.to, subject: opts.subject },
      "Email not sent: SendGrid not configured. Connect SendGrid in Replit Integrations to enable.",
    );
    return { sent: false, reason: "no-credentials" };
  }

  try {
    sgMail.setApiKey(creds.apiKey);
    await sgMail.send({
      to: opts.to,
      from: { email: creds.fromEmail, name: FROM_NAME },
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    logger.info({ to: opts.to, subject: opts.subject, from: creds.fromEmail }, "Email sent via SendGrid");
    return { sent: true };
  } catch (err: unknown) {
    const e = err as { response?: { body?: unknown }; message?: string };
    logger.error({ err: e.message, body: e.response?.body, to: opts.to }, "SendGrid send failed");
    return { sent: false, reason: "send-error" };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export async function sendQuoteSubmissionEmail(data: {
  requestNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  companyName?: string | null;
  deliveryCity?: string | null;
  message?: string | null;
  items: Array<{ productName: string; productSku?: string | null; quantity: number }>;
  submittedAt: Date;
}): Promise<void> {
  const submittedStr = data.submittedAt.toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC";

  const itemsText = data.items
    .map((it, i) => `  ${i + 1}. ${it.productName}${it.productSku ? ` (SKU: ${it.productSku})` : ""} — qty ${it.quantity}`)
    .join("\n");

  const itemsHtml = data.items
    .map(
      (it) => `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f1f1;">${escapeHtml(it.productName)}${
        it.productSku ? `<br/><span style="color:#888;font-size:11px;">SKU: ${escapeHtml(it.productSku)}</span>` : ""
      }</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f1f1;text-align:right;font-weight:600;">${it.quantity}</td>
    </tr>`,
    )
    .join("");

  const text = `New Quote Request — ${data.requestNumber}

Submitted: ${submittedStr}

CUSTOMER
  Name:    ${data.customerName}
  Email:   ${data.customerEmail}
  Phone:   ${data.customerPhone || "—"}
  Company: ${data.companyName || "—"}
  City:    ${data.deliveryCity || "—"}

PRODUCTS REQUESTED (${data.items.length})
${itemsText}

CUSTOMER NOTES
${data.message || "(none)"}
`;

  const html = `<div style="font-family:Inter,Arial,sans-serif;background:#f7f7f7;padding:24px;color:#1a1a1a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e6e6;">
    <div style="background:#8B0000;color:#ffffff;padding:20px 24px;">
      <div style="font-size:12px;letter-spacing:1.5px;opacity:.85;">AKSANTIMED · NEW QUOTE REQUEST</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px;">${escapeHtml(data.requestNumber)}</div>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px 0;color:#666;font-size:13px;">Submitted ${escapeHtml(submittedStr)}</p>
      <h3 style="margin:0 0 8px 0;color:#8B0000;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">Customer</h3>
      <table style="width:100%;font-size:14px;margin-bottom:24px;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#888;width:90px;">Name</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(data.customerName)}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(data.customerEmail)}" style="color:#8B0000;">${escapeHtml(data.customerEmail)}</a></td></tr>
        <tr><td style="padding:4px 0;color:#888;">Phone</td><td style="padding:4px 0;">${escapeHtml(data.customerPhone || "—")}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Company</td><td style="padding:4px 0;">${escapeHtml(data.companyName || "—")}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">City</td><td style="padding:4px 0;">${escapeHtml(data.deliveryCity || "—")}</td></tr>
      </table>

      <h3 style="margin:0 0 8px 0;color:#8B0000;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">Products requested (${data.items.length})</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;border:1px solid #f1f1f1;border-radius:8px;overflow:hidden;">
        <thead><tr style="background:#fafafa;">
          <th style="text-align:left;padding:8px 12px;font-size:11px;color:#888;text-transform:uppercase;">Product</th>
          <th style="text-align:right;padding:8px 12px;font-size:11px;color:#888;text-transform:uppercase;">Qty</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      ${
        data.message
          ? `<h3 style="margin:0 0 8px 0;color:#8B0000;font-size:14px;text-transform:uppercase;letter-spacing:.5px;">Customer notes</h3>
        <div style="background:#fdf6f6;border-left:3px solid #8B0000;padding:12px 16px;border-radius:4px;font-size:14px;line-height:1.5;color:#333;white-space:pre-wrap;">${escapeHtml(data.message)}</div>`
          : ""
      }
    </div>
    <div style="background:#fafafa;padding:14px 24px;font-size:12px;color:#888;text-align:center;border-top:1px solid #eee;">
      Open the admin dashboard to respond and price this request.
    </div>
  </div>
</div>`;

  await sendMail({
    to: RECIPIENTS,
    subject: `New Quote Request: ${data.requestNumber} — ${data.customerName}`,
    text,
    html,
  });
}

export async function sendNewUserEmail(data: {
  fullName: string;
  email: string;
  companyName: string;
  phone?: string | null;
  registeredAt: Date;
}): Promise<void> {
  const when = data.registeredAt.toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC";
  const text = `New customer registration on Aksantimed

Name:     ${data.fullName}
Email:    ${data.email}
Phone:    ${data.phone || "—"}
Company:  ${data.companyName}
Date:     ${when}
`;
  const html = `<div style="font-family:Inter,Arial,sans-serif;background:#f7f7f7;padding:24px;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e6e6e6;overflow:hidden;">
    <div style="background:#8B0000;color:#ffffff;padding:20px 24px;">
      <div style="font-size:12px;letter-spacing:1.5px;opacity:.85;">AKSANTIMED · NEW USER</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px;">${escapeHtml(data.fullName)} registered</div>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#888;width:90px;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color:#8B0000;">${escapeHtml(data.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#888;">Phone</td><td style="padding:6px 0;">${escapeHtml(data.phone || "—")}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Company</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(data.companyName)}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;">${escapeHtml(when)}</td></tr>
      </table>
    </div>
  </div>
</div>`;

  await sendMail({
    to: ["tembomarkj@gmail.com"],
    subject: `New customer registered: ${data.fullName}`,
    text,
    html,
  });
}
