import db from '../config/db.js';

// Dohvat svih poruka za specifični ticket kronološkim redom
export const getMessagesByTicketId = async (idTicketa) => {
  const query = `
    SELECT 
      p.*,
      k.ime AS posiljatelj_ime, k.prezime AS posiljatelj_prezime, k.uloga AS posiljatelj_uloga
    FROM poruka p
    JOIN korisnik k ON p.id_posiljatelja = k.id_korisnika
    WHERE p.id_ticketa = $1
    ORDER BY p.vrijeme_slanja ASC
  `;
  const { rows } = await db.query(query, [idTicketa]);
  return rows;
};

// Upis nove poruke
export const createMessage = async (idTicketa, idPosiljatelja, sadrzajPoruke) => {
  const query = `
    INSERT INTO poruka (id_ticketa, id_posiljatelja, sadrzaj_poruke)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const { rows } = await db.query(query, [idTicketa, idPosiljatelja, sadrzajPoruke]);
  return rows[0];
};