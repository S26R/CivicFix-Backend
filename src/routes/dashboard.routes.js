import { Router } from 'express';
import {  authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Route for the Citizen Dashboard
router.get('/citizen', authenticateUser, authorizeRoles('citizen'), (req, res) => {
  res.json({ msg: 'Welcome to the Citizen Dashboard' });
});

// Route for the Authority Dashboard
router.get('/authority', authenticateUser, authorizeRoles('authority'), (req, res) => {
  res.json({ msg: 'Welcome to the Authority Dashboard' });
});

// Route for the Department Dashboard
router.get('/department', authenticateUser, authorizeRoles('department'), (req, res) => {
  res.json({ msg: 'Welcome to the Department Dashboard' });
});

export default router;