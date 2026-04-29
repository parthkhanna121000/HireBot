const nodemailer = require("nodemailer");

// ─── TRANSPORTER ─────────────────────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const FROM = `"HireBot" <${process.env.SMTP_USER}>`;

// ─── BASE TEMPLATE ────────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: 'Segoe UI', sans-serif; color: #e0e0e0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #111; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 32px 40px; }
    .header h1 { margin: 0; color: #fff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.7); font-size: 13px; }
    .body { padding: 36px 40px; }
    .body h2 { margin: 0 0 12px; color: #fff; font-size: 20px; font-weight: 600; }
    .body p { margin: 0 0 16px; color: #aaa; font-size: 15px; line-height: 1.6; }
    .pill { display: inline-block; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }
    .pill-green { background: #052e16; color: #4ade80; border: 1px solid #166534; }
    .pill-red   { background: #1c0a0a; color: #f87171; border: 1px solid #7f1d1d; }
    .pill-blue  { background: #0c1a2e; color: #60a5fa; border: 1px solid #1e3a5f; }
    .pill-gold  { background: #1c1200; color: #fbbf24; border: 1px solid #78350f; }
    .cta { display: inline-block; margin-top: 8px; padding: 12px 28px; background: #7c3aed; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .divider { border: none; border-top: 1px solid #222; margin: 28px 0; }
    .detail-box { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px 24px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a2a; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; }
    .detail-value { color: #e0e0e0; font-weight: 500; }
    .footer { background: #0d0d0d; padding: 20px 40px; text-align: center; }
    .footer p { margin: 0; color: #444; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>HireBot</h1>
      <p>AI-Powered Hiring Platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© 2026 HireBot · This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── SEND HELPER ─────────────────────────────────────────────────────────────
const send = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[email] sent → ${to} | ${subject} | id: ${info.messageId}`);
    return { ok: true };
  } catch (err) {
    console.error(`[email] FAILED → ${to} |`, err.message);
    return { ok: false, error: err.message };
  }
};

// ─── 1. APPLICATION RECEIVED ─────────────────────────────────────────────────
const sendApplicationEmail = async ({ to, name, jobTitle, companyName }) => {
  const html = baseTemplate(`
    <h2>Application Received 📩</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your application for <strong>${jobTitle}</strong>${companyName ? ` at <strong>${companyName}</strong>` : ""} has been received and is being reviewed.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Position</span>
        <span class="detail-value">${jobTitle}</span>
      </div>
      ${companyName ? `<div class="detail-row"><span class="detail-label">Company</span><span class="detail-value">${companyName}</span></div>` : ""}
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value"><span class="pill pill-blue">Under Review</span></span>
      </div>
    </div>
    <p style="color:#666;font-size:13px;">We'll notify you as soon as there's an update.</p>
  `);
  return send({ to, subject: `Application Received — ${jobTitle}`, html });
};

// ─── 2. SHORTLISTED ──────────────────────────────────────────────────────────
const sendShortlistEmail = async ({
  to,
  name,
  jobTitle,
  companyName,
  recruiterNote,
}) => {
  const html = baseTemplate(`
    <h2>You've Been Shortlisted 🎉</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Great news! You have been shortlisted for the <strong>${jobTitle}</strong> position${companyName ? ` at <strong>${companyName}</strong>` : ""}.</p>
    ${recruiterNote ? `<div class="detail-box"><p style="margin:0;color:#aaa;font-size:14px;"><em>"${recruiterNote}"</em></p></div>` : ""}
    <p>The hiring team will be in touch soon with next steps.</p>
    <a href="${process.env.FRONTEND_URL}/applications" class="cta">View Application →</a>
  `);
  return send({
    to,
    subject: `You've been shortlisted for ${jobTitle} 🎉`,
    html,
  });
};

// ─── 3. REJECTION ────────────────────────────────────────────────────────────
const sendRejectionEmail = async ({
  to,
  name,
  jobTitle,
  companyName,
  recruiterNote,
}) => {
  const html = baseTemplate(`
    <h2>Application Update</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for your interest in the <strong>${jobTitle}</strong> role${companyName ? ` at <strong>${companyName}</strong>` : ""}. After careful consideration, we've decided to move forward with other candidates at this time.</p>
    ${recruiterNote ? `<div class="detail-box"><p style="margin:0;color:#aaa;font-size:14px;"><em>"${recruiterNote}"</em></p></div>` : ""}
    <p>Don't be discouraged — HireBot's Resume Analyzer and Interview Prep tools can help you stand out next time.</p>
    <a href="${process.env.FRONTEND_URL}/resume-analyzer" class="cta">Improve Your Resume →</a>
  `);
  return send({ to, subject: `Application Update — ${jobTitle}`, html });
};

// ─── 4. INTERVIEW INVITATION ─────────────────────────────────────────────────
const sendInterviewInviteEmail = async ({
  to,
  name,
  jobTitle,
  companyName,
  date,
  time,
  instructions,
}) => {
  const html = baseTemplate(`
    <h2>Interview Invitation 📅</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Congratulations! You've been invited to interview for the <strong>${jobTitle}</strong> position${companyName ? ` at <strong>${companyName}</strong>` : ""}.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value">${jobTitle}</span></div>
      ${companyName ? `<div class="detail-row"><span class="detail-label">Company</span><span class="detail-value">${companyName}</span></div>` : ""}
      ${date ? `<div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${date}</span></div>` : ""}
      ${time ? `<div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${time}</span></div>` : ""}
    </div>
    ${instructions ? `<p><strong>Instructions:</strong><br>${instructions}</p>` : ""}
    <a href="${process.env.FRONTEND_URL}/interview-prep" class="cta">Start Interview Prep →</a>
  `);
  return send({ to, subject: `Interview Invitation — ${jobTitle}`, html });
};

// ─── 5. PAYMENT CONFIRMATION ─────────────────────────────────────────────────
const sendPaymentConfirmationEmail = async ({
  to,
  name,
  plan,
  expiryDate,
  amount,
}) => {
  const html = baseTemplate(`
    <h2>Payment Successful ✅</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your payment was successful. You now have access to <strong>HireBot ${plan.toUpperCase()}</strong>.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Plan</span><span class="detail-value"><span class="pill pill-gold">PRO</span></span></div>
      <div class="detail-row"><span class="detail-label">Amount Paid</span><span class="detail-value">₹${(amount / 100).toFixed(2)}</span></div>
      <div class="detail-row"><span class="detail-label">Valid Until</span><span class="detail-value">${new Date(expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
    </div>
    <p>Enjoy unlimited AI resume analyses, interview prep reports, and priority processing.</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" class="cta">Go to Dashboard →</a>
  `);
  return send({
    to,
    subject: "Payment Confirmed — HireBot Pro Activated 🚀",
    html,
  });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const html = baseTemplate(`
    <h2>Reset Your Password 🔐</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>We received a request to reset your HireBot password. Click the button below — this link expires in <strong>15 minutes</strong>.</p>
    <a href="${resetUrl}" class="cta">Reset Password →</a>
    <hr class="divider" />
    <p style="color:#666;font-size:13px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
  `);
  return send({ to, subject: "Reset Your HireBot Password 🔐", html });
};

module.exports = {
  sendApplicationEmail,
  sendShortlistEmail,
  sendRejectionEmail,
  sendInterviewInviteEmail,
  sendPaymentConfirmationEmail,
  sendPasswordResetEmail,
};
