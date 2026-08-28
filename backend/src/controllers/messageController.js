import * as MessageModel from '../models/messageModel.js';
import * as TicketModel from '../models/ticketModel.js';
import db from '../config/db.js';
import { sendNotificationEmail } from '../utils/mailer.js';


export const getTicketMessages = async (req, res) => {

  try {

    const { ticketId } = req.params;

    const messages =
      await MessageModel.getMessagesByTicketId(ticketId);

    res.json(messages);

  } catch (error) {

    console.error('Greška pri dohvatu poruka:', error);

    res.status(500).json({
      message: 'Greška na poslužitelju.'
    });

  }

};


export const sendMessage = async (req, res) => {

  try {

    const { ticketId } = req.params;

    const { sadrzaj_poruke } = req.body;

    const id_posiljatelja = req.user.id_korisnika;


    // Provjera sadržaja poruke

    if (!sadrzaj_poruke) {

      return res.status(400).json({
        message: 'Sadržaj poruke ne može biti prazan.'
      });

    }


    // Provjera postoji li ticket

    const ticket =
      await TicketModel.getTicketById(ticketId);


    if (!ticket) {

      return res.status(404).json({
        message: 'Ticket ne postoji.'
      });

    }


    // Provjera statusa ticketa

    if (ticket.status === 'Zatvoren') {

      return res.status(400).json({
        message:
          'Nije moguće slati poruke na zatvoreni ticket.'
      });

    }


    // Spremanje poruke u bazu

    const newMessage =
      await MessageModel.createMessage(
        ticketId,
        id_posiljatelja,
        sadrzaj_poruke
      );


    console.log('✅ Poruka spremljena:', newMessage);


    // Dohvat emaila korisnika i administratora

    const ticketRes = await db.query(

      `
      SELECT
        t.*,
        k.e_mail AS korisnik_email,
        a.e_mail AS admin_email

      FROM ticket t

      JOIN korisnik k
        ON t.id_korisnika = k.id_korisnika

      LEFT JOIN korisnik a
        ON t.id_administratora = a.id_korisnika

      WHERE t.id_ticketa = $1
      `,

      [ticketId]

    );


    const ticketData = ticketRes.rows[0];


    if (ticketData) {

      let recipientEmail = null;


      // Ako poruku šalje korisnik -> šalji adminu

      if (
        Number(id_posiljatelja) ===
        Number(ticketData.id_korisnika)
      ) {

        recipientEmail =
          ticketData.admin_email ||
          process.env.EMAIL_USER;

      }

      // Ako poruku šalje admin -> šalji korisniku

      else {

        recipientEmail =
          ticketData.korisnik_email;

      }


      console.log(
        `📧 Priprema slanja maila.
        Primatelj: ${recipientEmail},
        Pošiljatelj ID: ${id_posiljatelja}`
      );


      if (recipientEmail) {

        await sendNotificationEmail(

          recipientEmail,

          `Novi odgovor na ticketu #${ticketId}: ${ticketData.naslov}`,

          sadrzaj_poruke,

          ticketId

        );

      } else {

        console.warn(
          '⚠️ Nije pronađena e-mail adresa primatelja.'
        );

      }

    }


    res.status(201).json(newMessage);


  } catch (error) {

    console.error(
      'Greška pri slanju poruke:',
      error
    );

    res.status(500).json({
      message: 'Greška na poslužitelju.'
    });

  }

};