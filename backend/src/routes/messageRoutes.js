import express from 'express';
import { getTicketMessages, sendMessage } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // Sve rute za poruke zahtijevaju prijavu

router.get('/:ticketId', getTicketMessages);
router.post('/:ticketId', sendMessage);


export default router;