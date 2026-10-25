import nodemailer from "nodemailer";

const createMailer = (port, secure) => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER || "info@workfle.com",
      pass: process.env.SMTP_PASS || "Harpreet@2210#$",
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 8000, // 8 seconds max to connect
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
};

let primaryTransporter = null;
let fallbackTransporter = null;

export const getTransporter = () => {
  if (!primaryTransporter) {
    const configuredPort = Number(process.env.SMTP_PORT) || 465;
    const isSecure = process.env.SMTP_SECURE === "true" || configuredPort === 465;
    primaryTransporter = createMailer(configuredPort, isSecure);
  }
  return primaryTransporter;
};

export const getFallbackTransporter = () => {
  if (!fallbackTransporter) {
    // Port 587 STARTTLS as reliable alternative on cloud hosts
    fallbackTransporter = createMailer(587, false);
  }
  return fallbackTransporter;
};

/**
 * Send 4-digit verification code email to user
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 4 digit verification code
 */
export const sendOtpEmail = async (toEmail, otp) => {
  const fromAddress = process.env.SMTP_FROM || '"Workfle" <info@workfle.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Workfle Verification Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #0F172A; }
        .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); }
        .header { background: #2563EB; padding: 28px 24px; text-align: center; }
        .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #DBEAFE; margin: 6px 0 0; font-size: 14px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 8px; }
        .message { font-size: 14px; color: #64748B; line-height: 22px; margin-bottom: 24px; }
        .code-box { background: #EFF6FF; border: 2px dashed #93C5FD; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1D4ED8; font-family: monospace, sans-serif; }
        .code-expiry { font-size: 12px; color: #64748B; margin-top: 8px; }
        .warning { font-size: 12px; color: #94A3B8; line-height: 18px; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px; }
        .footer { background: #F8FAFC; padding: 16px 24px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Workfle</h1>
          <p>Fleet, Workshop & Rental Management</p>
        </div>
        <div class="content">
          <div class="greeting">Hello,</div>
          <div class="message">
            Thank you for registering with Workfle. To complete your account verification, please enter the following 4-digit code in the app:
          </div>
          <div class="code-box">
            <div class="code">${otp}</div>
            <div class="code-expiry">Valid for 10 minutes</div>
          </div>
          <div class="warning">
            If you did not request this verification code, please ignore this email or contact support at <a href="mailto:info@workfle.com" style="color: #2563EB; text-decoration: none;">info@workfle.com</a>.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Workfle. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Your Workfle verification code is: ${otp}. It is valid for 10 minutes.`;

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: `${otp} is your Workfle Verification Code`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const mailer = getTransporter();
    return await mailer.sendMail(mailOptions);
  } catch (primaryErr) {
    console.warn("[EmailService] Primary SMTP (Port 465) failed, attempting fallback (Port 587):", primaryErr.message);
    try {
      const fallbackMailer = getFallbackTransporter();
      return await fallbackMailer.sendMail(mailOptions);
    } catch (fallbackErr) {
      console.error("[EmailService] Both Primary and Fallback SMTP failed:", fallbackErr.message);
      throw fallbackErr;
    }
  }
};
