const express = require('express');
const router = express.Router();
const { getUsers, updatePromotion, updatePerformance, recommendPromotion, addPoints, getPointTransactions, updateFace, addDemerits } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.put('/:id/promotion', protect, authorize('Admin', 'HR'), updatePromotion);
router.put('/:id/performance', protect, authorize('Admin', 'HR', 'TeamLeader'), updatePerformance);
router.put('/:id/recommend-promotion', protect, authorize('TeamLeader'), recommendPromotion);
router.post('/:id/points', protect, authorize('Admin'), addPoints);
router.post('/:id/demerits', protect, authorize('Admin', 'HR'), addDemerits);
router.get('/me/points', protect, getPointTransactions);
router.put('/me/face', protect, (req, res, next) => { req.params.id = req.user.id; next(); }, updateFace);
router.put('/:id/face', protect, updateFace);

module.exports = router;
