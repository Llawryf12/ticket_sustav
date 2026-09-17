import bcrypt from 'bcryptjs';

import {
  createUser,
  findUserByUsername
} from '../models/userModel.js';

export const addUser = async (req, res) => {
  const {
    ime,
    prezime,
    e_mail,
    korisnicko_ime,
    lozinka,
    uloga,
    firma
  } = req.body;

  // 1. Provjera obaveznih podataka
  if (
    !ime ||
    !prezime ||
    !e_mail ||
    !korisnicko_ime ||
    !lozinka ||
    !uloga ||
    !firma
  ) {
    return res.status(400).json({
      message: 'Sva polja su obavezna.'
    });
  }

  // 2. Samo administrator može dodavati korisnike
  if (req.user?.uloga !== 'Administrator') {
    return res.status(403).json({
      message: 'Nemate ovlasti za dodavanje korisnika.'
    });
  }

  try {
    // 3. Provjeri postoji li već korisničko ime
    const existingUser = await findUserByUsername(korisnicko_ime);

    if (existingUser) {
      return res.status(409).json({
        message: 'Korisničko ime već postoji.'
      });
    }

    // 4. Hashiranje lozinke
    const lozinka_hash = await bcrypt.hash(lozinka, 10);

    // 5. Spremanje korisnika u bazu
    const newUser = await createUser({
      ime,
      prezime,
      e_mail,
      korisnicko_ime,
      lozinka_hash,
      uloga,
      firma
    });

    // 6. Vrati podatke novog korisnika
    return res.status(201).json({
      message: 'Korisnik je uspješno dodan.',
      user: newUser
    });

  } catch (error) {
    console.error('Greška pri dodavanju korisnika:', error);

    return res.status(500).json({
      message: 'Greška na poslužitelju prilikom dodavanja korisnika.'
    });
  }
};