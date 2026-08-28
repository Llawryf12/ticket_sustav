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