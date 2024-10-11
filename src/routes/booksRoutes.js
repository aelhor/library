const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const bookController = require("../controllers/booksController");
const validationService = require("../middlewares/validationMiddleware");

const router = express.Router();




// Books CRUD
// Create a book with full validation
router.post(
  "/",
  validationService.validateSchema(validationService.getBookSchema()),
  (req, res, next) => bookController.addBook(req, res, next)
);
router.get("/", (req, res, next) => bookController.getAllBooks(req, res, next));
router.get("/search", (req, res, next) =>
  bookController.searchBooks(req, res, next)
);
// Update a book with partial validation (PATCH)
router.patch(
  "/:id",
  validationService.validateSchema(validationService.getPartialBookSchema()), // Allow partial updates
  (req, res, next) => bookController.updateBook(req, res, next)
);

// Replace  a book with full validation
router.put(
  "/:id",
  validationService.validateSchema(validationService.getPartialBookSchema()), // Allow partial updates
  (req, res, next) => bookController.replaceBook(req, res, next)
);

router.delete("/:id", (req, res, next) =>
  bookController.deleteBook(req, res, next)
);

module.exports = router;
