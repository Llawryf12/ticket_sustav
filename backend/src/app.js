import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);

// Bazna ruta za provjeru rada poslužitelja
app.get('/', (req, res) => {
  res.json({ message: 'Ticketing System API radi uspješno!' });
});

export default app;