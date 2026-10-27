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
    family: 4, // CRITICAL: Force IPv4 connection to prevent Linux/Render IPv6 ETIMEDOUT
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
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
 * @param {string} purpose - "register" | "login" | "password_reset"
 */
export const sendOtpEmail = async (toEmail, otp, purpose = "register") => {
  const fromAddress = process.env.SMTP_FROM || '"Workfle" <info@workfle.com>';

  let subjectTitle = `${otp} is your Workfle Verification Code`;
  let headingText = "Workfle Verification";
  let messageText = "Thank you for registering with Workfle. To complete your account verification, please enter the following 4-digit code in the app:";

  if (purpose === "login") {
    subjectTitle = `${otp} is your Workfle Login Code`;
    headingText = "Login Verification";
    messageText = "You are attempting to log in to your Workfle account. Please enter the following 4-digit code to complete sign in:";
  } else if (purpose === "password_reset") {
    subjectTitle = `${otp} is your Password Reset Code`;
    headingText = "Reset Your Password";
    messageText = "We received a request to reset your Workfle account password. Please enter the following 4-digit verification code:";
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subjectTitle}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #0F172A; }
        .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(1, 49, 27, 0.08); }
        .header { background: linear-gradient(135deg, #01311B 0%, #064E3B 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #A7F3D0; margin: 6px 0 0; font-size: 14px; font-weight: 500; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 8px; }
        .message { font-size: 14px; color: #475569; line-height: 22px; margin-bottom: 24px; }
        .code-box { background: #ECFDF5; border: 2px dashed #6EE7B7; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0; }
        .code { font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #065F46; font-family: monospace, sans-serif; }
        .code-expiry { font-size: 12px; color: #047857; margin-top: 8px; font-weight: 600; }
        .warning { font-size: 12px; color: #94A3B8; line-height: 18px; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px; }
        .footer { background: #F8FAFC; padding: 16px 24px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Workfle</h1>
          <p>${headingText}</p>
        </div>
        <div class="content">
          <div class="greeting">Hello,</div>
          <div class="message">${messageText}</div>
          <div class="code-box">
            <div class="code">${otp}</div>
            <div class="code-expiry">Expires in 10 minutes</div>
          </div>
          <div class="warning">
            If you did not request this verification code, please ignore this email or contact support at <a href="mailto:info@workfle.com" style="color: #059669; text-decoration: none; font-weight: 600;">info@workfle.com</a>.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Workfle. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Your Workfle code is: ${otp}. It is valid for 10 minutes.`;

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: subjectTitle,
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
