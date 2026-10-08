const router = require('express').Router();
const { authenticate, requireRole } = require('../middlewares/auth');

router.use('/auth', require('./auth.routes'));
router.use('/courses', require('./course.routes'));
router.use('/admin', authenticate, requireRole('ADMIN'), require('./admin.routes'));
router.use('/enrollments', require('./enrollment.routes'));

module.exports = router;