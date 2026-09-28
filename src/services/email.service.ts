import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    throw new Error("SMTP_CONFIGURATION_MISSING");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
  });
}

function getFromAddress() {
  return (
    process.env.EMAIL_FROM ??
    process.env.SMTP_USER ??
    "TaxReady"
  );
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = getTransporter();

  try {
    const result = await transporter.sendMail({
      from: getFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    return {
      id: result.messageId,
    };
  } catch (error) {
    console.error("SMTP email send failed:", error);
    throw new Error("EMAIL_SEND_FAILED");
  }
}