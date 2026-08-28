import dotenv from 'dotenv';
import app from './app.js';
import db from './config/db.js';
import messageRoutes from './routes/messageRoutes.js';

// Ako je Axios baseURL postavljen na http://localhost:3000/api
app.use('/api/messages', messageRoutes); 

// ILI ako je baseURL http://localhost:3000
app.use('/messages', messageRoutes);

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Poslužitelj je pokrenut na portu ${PORT}`);
  
  // Testna provjera baze prilikom pokretanja
  try {
    await db.query('SELECT NOW()');
  } catch (err) {
    console.error('Greška pri spajanju na bazu:', err.message);
  }
});