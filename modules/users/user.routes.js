const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { auth } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { ROLES } = require('../../constants/roles');

router.use(auth);
router.use(authorize(ROLES.SUPERADMIN));

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/toggle-status', userController.toggleUserStatus);

module.exports = router;
