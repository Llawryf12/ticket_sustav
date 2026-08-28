import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByUsername } from '../models/userModel.js';

export const login = async (req, res) => {
  const { korisnickoIme, lozinka } = req.body;

  if (!korisnickoIme || !lozinka) {
    return res.status(400).json({ message: 'Korisničko ime i lozinka su obavezni.' });
  }

  try {
    // 1. Pronađi korisnika u bazi
    const user = await findUserByUsername(korisnickoIme);
    if (!user) {
      return res.status(401).json({ message: 'Neispravno korisničko ime ili lozinka.' });
    }

    // 2. Provjeri lozinku (bcrypt)
    // Napomena: Ako u bazi imaš čist tekst (plain text) za test, obavezno generiraj hash pomoću bcrypt-a
    const isMatch = await bcrypt.compare(lozinka, user.lozinka_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Neispravno korisničko ime ili lozinka.' });
    }

    // 3. Generiraj JWT token
    const token = jwt.sign(
      {
        id_korisnika: user.id_korisnika,
        korisnicko_ime: user.korisnicko_ime,
        uloga: user.uloga,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Vrati odgovor
    return res.json({
      message: 'Prijava uspješna.',
      token,
      user: {
        id_korisnika: user.id_korisnika,
        ime: user.ime,
        prezime: user.prezime,
        e_mail: user.e_mail,
        korisnicko_ime: user.korisnicko_ime,
        uloga: user.uloga,
      },
    });
  } catch (error) {
    console.error('Greška pri prijavi:', error);
    return res.status(500).json({ message: 'Greška na poslužitelju prilikom prijave.' });
  }
};