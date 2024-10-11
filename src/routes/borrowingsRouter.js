const express = require("express");
const borrwoingController = require("../controllers/borrowingsController");
const verifyToken = require("../middlewares/authMiddleware");
const validationService = require("../middlewares/validationMiddleware");
const limiter = require("../middlewares/rateLimit");

const router = express.Router();

// Borrowings
router.post(
  "/checkout",
  verifyToken,
  validationService.validateSchema(validationService.getCheckOutSchema()),
  (req, res, next) => borrwoingController.checkOutBook(req, res, next)
);

router.patch(
  "/return",
  verifyToken,
  validationService.validateSchema(validationService.getRetunBookSchema()),
  (req, res, next) => borrwoingController.returnBook(req, res, next)
);

router.get("/borrowed", verifyToken, (req, res, next) =>
  borrwoingController.getBorrowedBooks(req, res, next)
);

router.get("/overdue", verifyToken, (req, res, next) =>
  borrwoingController.getOverdueBooks(req, res, next)
);

// Generate analytical report for borrowing in a specific period
router.get("/reports", verifyToken, (req, res, next) =>
  borrwoingController.generateBorrowingReport(req, res, next)
);

// Export overdue borrows to CSV
router.get("/export/overdue/csv", verifyToken, limiter, (req, res, next) =>
  borrwoingController.exportOverdueToCSV(req, res, next)
);

router.get("/export/borrowing/csv", verifyToken, limiter, (req, res, next) =>
  borrwoingController.exportAllBorrowingToCSV(req, res, next)
);

module.exports = router;
