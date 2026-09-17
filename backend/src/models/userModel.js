import db from '../config/db.js';

export const findUserByUsername = async (korisnickoIme) => {
  const query = 'SELECT * FROM korisnik WHERE korisnicko_ime = $1';
  const { rows } = await db.query(query, [korisnickoIme]);
  return rows[0];
};

export const findUserById = async (id) => {
  const query = 'SELECT id_korisnika, ime, prezime, e_mail, korisnicko_ime, uloga FROM korisnik WHERE id_korisnika = $1';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export const findAllAdmins = async () => {
  const query = "SELECT id_korisnika, ime, prezime, e_mail FROM korisnik WHERE uloga = 'Administrator'";
  const { rows } = await db.query(query);
  return rows;
};

export const createUser = async ({
  ime,
  prezime,
  e_mail,
  korisnicko_ime,
  lozinka_hash,
  uloga,
  firma
}) => {
  const query = `
    INSERT INTO korisnik (
      ime,
      prezime,
      e_mail,
      korisnicko_ime,
      lozinka_hash,
      uloga,
      firma
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id_korisnika,
      ime,
      prezime,
      e_mail,
      korisnicko_ime,
      uloga,
      firma
  `;

  const values = [
    ime,
    prezime,
    e_mail,
    korisnicko_ime,
    lozinka_hash,
    uloga,
    firma
  ];

  const { rows } = await db.query(query, values);

  return rows[0];
};