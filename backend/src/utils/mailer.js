import nodemailer from 'nodemailer';
import net from 'net';

const socket = net.createConnection({
  host: 'smtp-relay.brevo.com',
  port: 587,
  timeout: 10000
});

socket.on('connect', () => {
  console.log('✅ TCP VEZA PREMA BREVO 587 RADI');
  socket.destroy();
});

socket.on('timeout', () => {
  console.error('❌ TCP VEZA PREMA BREVO 587 TIMEOUT');
  socket.destroy();
});

socket.on('error', (error) => {
  console.error('❌ TCP VEZA PREMA BREVO 587 GREŠKA:', error.message);
});

console.log('SMTP konfiguracija:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
  passExists: Boolean(process.env.EMAIL_PASS)
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true za port 465, false za 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Provjera SMTP veze pri pokretanju
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP VEZA NIJE USPJEŠNA:', error);
  } else {
    console.log('✅ SMTP VEZA USPJEŠNA:', success);
  }
});


export const sendNotificationEmail = async (toEmail, subject, textContent, ticketId) => {
  if (!toEmail) {
    console.warn('⚠️ Slanje emaila otkazano: Adresa primatelja (toEmail) je prazna.');
    return;
  }

  try {
    const mailOptions = {
      from: `"Helpdesk Podrška" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1976D2;">Novi odgovor na ticketu #${ticketId}</h2>
          <p style="font-size: 15px;">Stigla je nova poruka u vezi vašeg zahtjeva:</p>
          <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #1976D2; margin: 15px 0;">
            ${textContent}
          </blockquote>
          <p style="font-size: 13px; color: #666;">Prijavite se u sustav kako biste odgovorili na poruku.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email obavijest uspješno poslana na: ${toEmail} (ID: ${info.messageId})`);
  } catch (error) {
    console.error('❌ Greška pri slanju emaila:', error.message);
  }
};