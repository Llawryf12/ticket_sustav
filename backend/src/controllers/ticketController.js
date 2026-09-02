import * as TicketModel from '../models/ticketModel.js';
import db from '../config/db.js';

export const getTickets = async (req, res) => {
  try {
    const { uloga, id_korisnika } = req.user;
    const { status } = req.query;

    let tickets;
    if (uloga === 'Administrator') {
      tickets = await TicketModel.getAllTickets(status);
    } else {
      tickets = await TicketModel.getTicketsByUser(id_korisnika);
    }

    res.json(tickets);
  } catch (error) {
    console.error('Greška pri dohvatu ticketa:', error);
    res.status(500).json({ message: 'Greška na poslužitelju.' });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await TicketModel.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket nije pronađen.' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Greška pri dohvatu detalja ticketa:', error);
    res.status(500).json({ message: 'Greška na poslužitelju.' });
  }
};

export const createNewTicket = async (req, res) => {
  try {
    const { naslov, opis, kategorija, prioritet, datum_nastanka_problema } = req.body;
    const id_korisnika = req.user.id_korisnika;

    if (!naslov || !opis || !kategorija || !prioritet) {
      return res.status(400).json({ message: 'Obavezna polja nisu popunjena.' });
    }

    const newTicket = await TicketModel.createTicket({
      naslov,
      opis,
      kategorija,
      prioritet,
      datum_nastanka_problema: datum_nastanka_problema || new Date(),
      id_korisnika
    });

    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Greška pri kreiranju ticketa:', error);
    res.status(500).json({ message: 'Greška na poslužitelju.' });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, id_administratora } = req.body;

    const updated = await TicketModel.updateTicketStatusAndAdmin(id, status, id_administratora);
    res.json(updated);
  } catch (error) {
    console.error('Greška pri ažuriranju ticketa:', error);
    res.status(500).json({ message: 'Greška na poslužitelju.' });
  }
};

export const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  
  const { 
    status, 
    id_administratora, 
    utroseno_minuta, 
    je_fakturirano, 
    satnica 
  } = req.body || {};

  if (!status) {
    return res.status(400).json({ message: 'Status je obavezno polje.' });
  }

  try {
    // Sigurno pretvaranje u odgovarajuće tipove
    const minute = Number(utroseno_minuta) || 0;
    const poSatu = Number(satnica) || 0;
    const fakturirano = Boolean(je_fakturirano);

    // Izračun: ako je označeno za fakturiranje, računamo iznos
    const ukupnoCijena = fakturirano ? parseFloat(((minute / 60) * poSatu).toFixed(2)) : 0.00;

    const result = await db.query(
      `UPDATE ticket 
       SET status = $1::varchar, 
           id_administratora = COALESCE($2, id_administratora),
           utroseno_minuta = $3,
           je_fakturirano = $4,
           satnica = $5,
           ukupna_cijena = $6,
           datum_zatvaranja = CASE WHEN $1::varchar IN ('Riješen', 'Zatvoren') THEN CURRENT_TIMESTAMP ELSE datum_zatvaranja END
       WHERE id_ticketa = $7 
       RETURNING *`,
      [
        status, 
        id_administratora || null, 
        minute, 
        fakturirano, 
        poSatu, 
        ukupnoCijena, 
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Ticket nije pronađen.' });
    }

    res.json({ message: 'Status uspješno ažuriran.', ticket: result.rows[0] });
  } catch (error) {
    console.error('Greška pri promjeni statusa:', error);
    res.status(500).json({ message: 'Greška na poslužitelju.' });
  }
};