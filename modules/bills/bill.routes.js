const express = require("express");
const router = express.Router();
const billController = require("./bill.controller");
const { auth } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/role.middleware");
const { ROLES } = require("../../constants/roles");

router.use(auth);

router.post("/", authorize(ROLES.SALES), billController.createBill);
router.get("/", billController.getBills);
router.get("/:id", billController.getBillById);
router.put("/:id", billController.updateBill);
router.delete(
  "/:id",
  authorize(ROLES.SALES, ROLES.SUPERADMIN),
  billController.deleteBill,
);
router.post("/:id/submit", authorize(ROLES.SALES), billController.submitBill);
router.post(
  "/:id/approve",
  authorize(ROLES.ACCOUNTANT),
  billController.approveBill,
);
router.post(
  "/:id/reject",
  authorize(ROLES.ACCOUNTANT),
  billController.rejectBill,
);
router.post(
  "/:id/send-email",
  authorize(ROLES.SALES),
  billController.sendBillEmailToClient,
);

module.exports = router;
