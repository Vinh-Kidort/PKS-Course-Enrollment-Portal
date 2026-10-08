const router = require('express').Router();
const validate = require('../middlewares/validate');
const { authenticate, requireRole } = require('../middlewares/auth');
const { enrollSchema } = require('../validators/enrollment.validator');
const ctrl = require('../controllers/enrollment.controller');

router.use(authenticate);
router.post('/', requireRole('STUDENT'), validate(enrollSchema), ctrl.enroll);
router.get('/me', ctrl.myEnrollments);

module.exports = router;