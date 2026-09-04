import db from '../config/db.js';

// Dohvat svih ticketa (s imenom autor-korisnika i administratora)
export const getAllTickets = async (filterStatus, filterFirma) => {
  let query = `
    SELECT 
      t.*,
      k.ime AS korisnik_ime, k.prezime AS korisnik_prezime, k.firma AS firma,
      a.ime AS admin_ime, a.prezime AS admin_prezime
    FROM ticket t
    JOIN korisnik k ON t.id_korisnika = k.id_korisnika
    LEFT JOIN korisnik a ON t.id_administratora = a.id_korisnika
  `;
  const params = [];
  const conditions = [];


  // Filtriranje po statusu
  if (filterStatus && filterStatus !== 'Svi') {
    params.push(filterStatus);
    conditions.push(`t.status = $${params.length}`);
  }

  // Filtriranje po firmi
  if (filterFirma && filterFirma !== 'Svi') {
    params.push(filterFirma);
    conditions.push(`k.firma = $${params.length}`);
  }

  // Dodavanje WHERE samo ako postoji barem jedan filter
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY t.datum_kreiranja DESC`;

  const { rows } = await db.query(query, params);

  return rows;
};

// Dohvat ticketa za određenog korisnika (također dodano za svaki slučaj)
export const getTicketsByUser = async (idKorisnika) => {
  const query = `
    SELECT 
      t.*,
      k.firma AS firma,
      a.ime AS admin_ime, a.prezime AS admin_prezime
    FROM ticket t
    JOIN korisnik k ON t.id_korisnika = k.id_korisnika
    LEFT JOIN korisnik a ON t.id_administratora = a.id_korisnika
    WHERE t.id_korisnika = $1
    ORDER BY t.datum_kreiranja DESC
  `;
  const { rows } = await db.query(query, [idKorisnika]);
  return rows;
};

// Dohvat pojedinačnog ticketa po ID-u
export const getTicketById = async (idTicketa) => {
  const query = `
    SELECT 
      t.*,
      k.ime AS korisnik_ime, k.prezime AS korisnik_prezime, k.e_mail AS korisnik_email,
      a.ime AS admin_ime, a.prezime AS admin_prezime, a.e_mail AS admin_email
    FROM ticket t
    JOIN korisnik k ON t.id_korisnika = k.id_korisnika
    LEFT JOIN korisnik a ON t.id_administratora = a.id_korisnika
    WHERE t.id_ticketa = $1
  `;
  const { rows } = await db.query(query, [idTicketa]);
  return rows[0];
};

// Kreiranje novog ticketa
export const createTicket = async (ticketData) => {
  const { naslov, opis, kategorija, prioritet, datum_nastanka_problema, id_korisnika } = ticketData;
  const query = `
    INSERT INTO ticket (naslov, opis, kategorija, prioritet, datum_nastanka_problema, id_korisnika)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const { rows } = await db.query(query, [naslov, opis, kategorija, prioritet, datum_nastanka_problema, id_korisnika]);
  return rows[0];
};

// Promjena statusa i/ili dodjela administratoru
export const updateTicketStatusAndAdmin = async (idTicketa, status, idAdministratora) => {
  let datumZatvaranja = null;
  if (status === 'Zatvoren') {
    datumZatvaranja = new Date();
  }

  const query = `
    UPDATE ticket 
    SET status = $1, id_administratora = $2, datum_zatvaranja = $3
    WHERE id_ticketa = $4
    RETURNING *
  `;
  const { rows } = await db.query(query, [status, idAdministratora || null, datumZatvaranja, idTicketa]);
  return rows[0];
};

//dohvat svih naziva firmi iz tablice korisnik
export const getAllCompanies = async () => {
  const query = `SELECT DISTINCT firma FROM korisnik WHERE firma IS NOT NULL AND firma != '' ORDER BY firma ASC`;
  const { rows } = await db.query(query);
  return rows.map(r => r.firma);
};