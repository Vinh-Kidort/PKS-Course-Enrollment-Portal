const router = require('express').Router();
const validate = require('../middlewares/validate');
const { optionalAuth } = require('../middlewares/auth');
const { listQuerySchema, idParamSchema } = require('../validators/course.validator');
const ctrl = require('../controllers/course.controller');

router.get('/', validate(listQuerySchema, 'query'), ctrl.list);
router.get('/categories', ctrl.categories); // phải đứng TRƯỚC '/:id'
router.get('/:id', optionalAuth, validate(idParamSchema, 'params'), ctrl.detail);

module.exports = router;