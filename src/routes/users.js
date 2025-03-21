const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protection to all routes
router.use(protect);
// Apply authorization to all routes (only admins can access)
router.use(authorize('admin'));

// Check if functions exist before using them as route handlers
router
  .route('/')
  .get(getUsers || ((req, res) => res.status(500).json({ error: 'Controller not implemented' })))
  .post(createUser || ((req, res) => res.status(500).json({ error: 'Controller not implemented' })));

router
  .route('/:id')
  .get(getUser || ((req, res) => res.status(500).json({ error: 'Controller not implemented' })))
  .put(updateUser || ((req, res) => res.status(500).json({ error: 'Controller not implemented' })))
  .delete(deleteUser || ((req, res) => res.status(500).json({ error: 'Controller not implemented' })));

module.exports = router;