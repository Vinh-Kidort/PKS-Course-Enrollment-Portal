const router = require('express').Router();
const validate = require('../middlewares/validate');
const enrollmentCtrl = require('../controllers/enrollment.controller');
const {
  createCourseSchema, updateCourseSchema, visibilitySchema, idParamSchema,
} = require('../validators/course.validator');
const courseCtrl = require('../controllers/course.controller');

router.get('/courses', courseCtrl.adminList);
router.post('/courses', validate(createCourseSchema), courseCtrl.adminCreate);
router.put('/courses/:id', validate(idParamSchema, 'params'), validate(updateCourseSchema), courseCtrl.adminUpdate);
router.patch('/courses/:id/visibility', validate(idParamSchema, 'params'), validate(visibilitySchema), courseCtrl.adminSetVisibility);
router.delete('/courses/:id', validate(idParamSchema, 'params'), courseCtrl.adminRemove);
router.get('/courses/:id/enrollments', validate(idParamSchema, 'params'), enrollmentCtrl.adminListByCourse);

module.exports = router;