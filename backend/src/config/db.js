import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Provjeravamo radi li se o produkciji (Renderu)
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const pool = new Pool({
  // Ako postoji DATABASE_URL (Render), koristimo nju za spajanje
  connectionString: process.env.DATABASE_URL, 
  
  // Ako DATABASE_URL ne postoji (lokalno), koristimo pojedinačne detalje
  ...(process.env.DATABASE_URL ? {} : {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }),
  
  // OBAVEZAN SSL ZA RENDER
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Uspješno spajanje na PostgreSQL bazu podataka.');
});

pool.on('error', (err) => {
  console.error('Neočekivana pogreška na PostgreSQL klijentu:', err);
  process.exit(-1);
});

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
