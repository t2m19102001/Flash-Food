import express from 'express';
import {
    submitContact,
    getContacts,
    updateContactStatus,
    deleteContact
} from '../controllers/contactController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const contactRouter = express.Router();

// Public route - ai cũng có thể gửi liên hệ
contactRouter.post('/submit', submitContact);

// Admin routes - cần đăng nhập và quyền admin
contactRouter.get('/list', authMiddleware, adminMiddleware, getContacts);
contactRouter.put('/:id/status', authMiddleware, adminMiddleware, updateContactStatus);
contactRouter.delete('/:id', authMiddleware, adminMiddleware, deleteContact);

export default contactRouter;