const express = require('express');
const router = express.Router();
const food = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/menu', protect, food.getAllMenuItems);
router.post('/menu', protect, authorize('Chef', 'Admin'), food.createMenuItem);
router.delete('/menu/:id', protect, authorize('Chef', 'Admin'), food.deleteMenuItem);

router.get('/orders/all', protect, authorize('Chef', 'Admin'), food.getAllOrders);
router.get('/orders', protect, food.getMyOrders);
router.post('/orders', protect, authorize('Employee', 'TeamLeader', 'HR'), food.placeOrder);
router.put('/orders/:id', protect, authorize('Chef', 'Admin'), food.updateOrderStatus);

router.get('/polls', protect, food.getPolls);
router.post('/polls', protect, authorize('Chef', 'Admin', 'HR'), food.createPoll);
router.delete('/polls/:id', protect, authorize('Chef', 'Admin', 'HR'), food.deletePoll);
router.post('/polls/vote', protect, food.votePoll);

router.get('/suggestions', protect, food.getSuggestions);
router.post('/suggestions', protect, authorize('Employee', 'TeamLeader', 'HR'), food.submitSuggestion);
router.put('/suggestions/:id', protect, authorize('Chef', 'Admin'), food.updateSuggestionStatus);

router.post('/feedback', protect, food.submitFeedback);

module.exports = router;
