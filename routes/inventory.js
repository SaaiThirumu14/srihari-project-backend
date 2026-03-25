const express = require('express');
const router = express.Router();
const { getInventory, addInventoryItem, updateInventory, deleteInventoryItem } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Chef', 'Admin'));

router.get('/', getInventory);
router.post('/', addInventoryItem);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
