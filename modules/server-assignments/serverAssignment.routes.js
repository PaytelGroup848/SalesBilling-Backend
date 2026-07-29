const express = require("express");
const router = express.Router();
const assignmentController = require("./serverAssignment.controller");
const { auth } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");
const { ROLES } = require("../../constants/roles");

router.use(auth);
router.use(authorize(ROLES.SUPERADMIN, ROLES.SERVER_ADMIN));

router.post("/", assignmentController.createAssignment);
router.get("/", assignmentController.getAssignments);
router.get("/expiring", assignmentController.getExpiringAssignments);
router.get("/:id", assignmentController.getAssignmentById);
router.put("/:id", assignmentController.updateAssignment);
router.delete("/:id", assignmentController.deleteAssignment);

module.exports = router;
