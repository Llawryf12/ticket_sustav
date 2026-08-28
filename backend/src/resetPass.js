import bcrypt from 'bcryptjs';
import db from './config/db.js';

async function reset() {
  try {
    const salt = await bcrypt.genSalt(10);
    const passUser = await bcrypt.hash('lozinka123', salt);
    const passAdmin = await bcrypt.hash('admin123', salt);

    // Postavi lozinku za ihorvat na 'lozinka123'
    await db.query(
      'UPDATE korisnik SET lozinka_hash = $1 WHERE korisnicko_ime = $2',
      [passUser, 'ihorvat']
    );

    // Postavi lozinku za manic na 'admin123'
    await db.query(
      'UPDATE korisnik SET lozinka_hash = $1 WHERE korisnicko_ime = $2',
      [passAdmin, 'admin']
    );

    console.log('Lozinke su uspješno ažurirane u bazi!');
    process.exit(0);
  } catch (err) {
    console.error('Greška pri ažuriranju lozinki:', err);
    process.exit(1);
  }
}

reset();