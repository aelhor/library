const borrowingService = require("../services/borrwoingService");

const path = require("path");

class BorrowingController {
  async checkOutBook(req, res, next) {
    const { bookId } = req.body;
    const userId = req.user.userId;

    try {
      // Check if the book exists
      await borrowingService.getBookById(bookId);
      await borrowingService.checkBookAvailablty(bookId);
      const borrowing = await borrowingService.checkOutBook(userId, bookId);
      res.status(201).json(borrowing);
    } catch (error) {
      //   res.status(400).json({ error: error.message });
      next(error);
    }
  }

  async returnBook(req, res, next) {
    const { borrowingId } = req.body; // Get the borrowing record ID from the request body
    const userId = req.user.userId;

    try {
      // Check if Borrowing belongs to the user
      await borrowingService.checkBorrowing(borrowingId, userId);

      // Proceed with returning the book
      const updatedBorrowing = await borrowingService.returnBook(borrowingId);
      res
        .status(200)
        .json({ message: "Book returned successfully", updatedBorrowing });
    } catch (error) {
      //   if (error.statusCode === 401) {
      // return res.status(401).json({ error: error.message });
      //   }
      //   res.status(400).json({ error: error.message });
      next(error);
    }
  }

  async getBorrowedBooks(req, res, next) {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const borrowedBooks = await borrowingService.getBorrowedBooks(
        userId,
        page,
        limit
      );
      res.status(200).json(borrowedBooks);
    } catch (error) {
      //   res.status(500).json({ error: "Internal Server Error" });
      next(error); // Pass the error to the global error handler
    }
  }

  async getOverdueBooks(req, res, next) {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const overdueBooks = await borrowingService.getOverdueBooks(
        userId,
        page,
        limit
      );
      res.status(200).json(overdueBooks);
    } catch (error) {
      //   res.status(500).json({ error: "Internal Server Error" });
      next(error);
    }
  }

  // Generate borrowing report for a specific period
  async generateBorrowingReport(req, res, next) {
    const { startDate, endDate } = req.query;

    try {
      const reportData = await borrowingService.getBorrowingReport(
        startDate,
        endDate
      );
      res.status(200).json(reportData);
    } catch (error) {
      next(error);
    }
  }

  // Export overdue borrows of the last month in CSV
  async exportOverdueToCSV(req, res, next) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const userId = req.user.userId;

    try {
      const overdueData = await borrowingService.getOverdueBooks(
        userId,
        1,
        100
      ); // Get overdue books for the last month
      const filename = path.join(__dirname, "../../exports/overdue_borrows.csv");
      await borrowingService.exportBorrowingToCSV(overdueData, filename);
      res.download(filename);
    } catch (error) {
      next(error);
    }
  }

  // Export borrowing process of the last month in CSV
  async exportAllBorrowingToCSV(req, res, next) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    try {
      const borrowingData = await borrowingService.getBorrowingReport(
        oneMonthAgo,
        new Date()
      );
      const filename = path.join(__dirname, "../../exports/borrowing_process.csv");
      await borrowingService.exportBorrowingToCSV(borrowingData, filename);
      res.download(filename);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BorrowingController();
