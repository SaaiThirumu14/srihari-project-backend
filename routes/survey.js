const express = require('express');
const router = express.Router();
const { submitSurvey, getMySurvey, getDepartmentSurveys, forwardSurvey, getHRSurveys, getAllSurveys } = require('../controllers/surveyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/submit', protect, authorize('Employee'), submitSurvey);
router.get('/my', protect, authorize('Employee'), getMySurvey);
router.get('/department', protect, authorize('TeamLeader'), getDepartmentSurveys);
router.post('/forward/:surveyId', protect, authorize('TeamLeader'), forwardSurvey);
router.get('/hr/all', protect, authorize('HR', 'Admin'), getHRSurveys);
router.get('/all', protect, authorize('HR', 'Admin'), getAllSurveys);

module.exports = router;
