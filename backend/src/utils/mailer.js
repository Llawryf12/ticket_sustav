import { BrevoClient } from '@getbrevo/brevo'; 
const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY, }); 
export const sendNotificationEmail = async ( toEmail, subject, textContent, ticketId ) => 
  { if (!toEmail) 
    { console.warn( '⚠️ Slanje emaila otkazano: Adresa primatelja (toEmail) je prazna.' ); 
      return; } 
      try { const result = await brevo.transactionalEmails.sendTransacEmail({ sender: { name: process.env.BREVO_SENDER_NAME || 'Helpdesk Podrška', email: process.env.BREVO_SENDER_EMAIL, },
         to: [ { email: toEmail, }, ], subject: subject, htmlContent: ` <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;"> <h2 style="color: #1976D2;"> Novi odgovor na ticketu #${ticketId} </h2> <p style="font-size: 15px;"> Stigla je nova poruka u vezi vašeg zahtjeva: </p> <blockquote style=" background: #f5f5f5; padding: 15px; border-left: 4px solid #1976D2; margin: 15px 0; "> 
         ${textContent} </blockquote> <p style="font-size: 13px; color: #666;"> Prijavite se u sustav kako biste odgovorili na poruku. </p> </div> `, 
         textContent: ` Novi odgovor na ticketu #${ticketId} Stigla je nova poruka u vezi vašeg zahtjeva: ${textContent} Prijavite se u sustav kako biste odgovorili na poruku. `, }); console.log( `✅ Email uspješno poslan na: ${toEmail}` ); 
         console.log( `📧 Brevo Message ID: ${result.messageId}` ); }
          catch (error) 
          { console.error( '❌ Greška pri slanju emaila preko Brevo API-ja:', error?.message || error );
             if (error?.body) { console.error('Brevo odgovor:', error.body); } } };
