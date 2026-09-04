import express from 'express';
import { 
  getTickets, 
  getTicketById, 
  createNewTicket, 
  updateTicket, 
  updateTicketStatus, 
  getCompanies 
} from '../controllers/ticketController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // Sve rute za tickete zahtijevaju prijavu

// 1. Specifične rute idu PRVIJE
router.get('/companies', getCompanies);

// 2. Osnovne i parametarske rute idu NAKON njih
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', createNewTicket);
router.patch('/:id', updateTicket);
router.patch('/:id/status', updateTicketStatus);

export default router;