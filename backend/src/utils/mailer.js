import brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const sendNotificationEmail = async (
  toEmail,
  subject,
  textContent,
  ticketId
) => {
  if (!toEmail) {
    console.warn(
      '⚠️ Slanje emaila otkazano: Adresa primatelja (toEmail) je prazna.'
    );
    return;
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;

    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1976D2;">Novi odgovor na ticketu #${ticketId}</h2>

        <p style="font-size: 15px;">
          Stigla je nova poruka u vezi vašeg zahtjeva:
        </p>

        <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #1976D2; margin: 15px 0;">
          ${textContent}
        </blockquote>

        <p style="font-size: 13px; color: #666;">
          Prijavite se u sustav kako biste odgovorili na poruku.
        </p>
      </div>
    `;

    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Helpdesk Podrška',
      email: process.env.BREVO_SENDER_EMAIL
    };

    sendSmtpEmail.to = [
      {
        email: toEmail
      }
    ];

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(
      `✅ Email uspješno poslan na: ${toEmail}`
    );

    console.log('Brevo odgovor:', result);
  } catch (error) {
    console.error(
      '❌ Greška pri slanju emaila preko Brevo API-ja:',
      error?.response?.body || error.message || error
    );
  }
};