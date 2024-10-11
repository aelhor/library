const pool = require("../config/db");
const AppError = require("../utils/AppError");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// Helper function to ensure the directory exists
const ensureDirectoryExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }); // Create the directory and parent directories if needed
  }
};
class BookService {
  async checkOutBook(userId, bookId, duration = 14) {
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + duration); // Set due date

    const query = `
      INSERT INTO Borrowing (user_id, book_id, borrow_date, due_date) 
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const values = [userId, bookId, borrowDate, dueDate];

    const result = await pool.query(query, values);
    return result.rows[0]; // Return the borrowing record
  }

  async returnBook(borrowingId) {
    const returnDate = new Date();
    const query = `
      UPDATE Borrowing 
      SET return_date = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    const result = await pool.query(query, [returnDate, borrowingId]);

    if (result.rows.length === 0) {
      throw new Error("Borrowing record not found");
    }

    return result.rows[0];
  }

  async checkBorrowing(borrowingId, userId) {
    // Check if the borrowing belongs to the user
    const query = "SELECT * FROM Borrowing WHERE id = $1 AND user_id = $2;";
    const result = await pool.query(query, [borrowingId, userId]);

    if (result.rows.length === 0) {
      throw new AppError("Unauthorized access to this borrowing record", 401);
    }

    return result.rows[0];
  }

  async getBorrowedBooks(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit; // Calculate the offset for pagination

    const query = `
      SELECT b.*, br.borrow_date, br.due_date 
      FROM Book b
      JOIN borrowing br ON b.id = br.book_id
      WHERE br.user_id = $1 AND br.return_date IS NULL
      ORDER BY br.borrow_date DESC
      LIMIT $2 OFFSET $3;
    `;
    const values = [userId, limit, offset];

    const result = await pool.query(query, values);
    return result.rows;
  }

  async getOverdueBooks(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit; // Calculate the offset for pagination

    const query = `
      SELECT b.*, br.due_date 
      FROM Book b
      JOIN borrowing br ON b.id = br.book_id
      WHERE br.user_id = $1 AND br.return_date IS NULL AND br.due_date < CURRENT_TIMESTAMP
      ORDER BY br.due_date ASC
      LIMIT $2 OFFSET $3;
    `;
    const values = [userId, limit, offset];

    const result = await pool.query(query, values);
    return result.rows;
  }

  async getBorrowingReport(startDate, endDate) {
    const query = `
      SELECT br.id, u.name AS borrower, b.title, br.borrow_date, br.due_date, br.return_date
      FROM Borrowing br
      JOIN "User" u ON br.user_id = u.id
      JOIN Book b ON br.book_id = b.id
      WHERE br.borrow_date BETWEEN $1 AND $2
      ORDER BY br.borrow_date DESC;
    `;
    const result = await pool.query(query, [startDate, endDate]);

    return result.rows;
  }

  // Bouns
  // Method to export borrowing data as CSV
  async exportBorrowingToCSV(data, filename) {
    // Ensure the exports directory exists
    ensureDirectoryExists(filename);
    const csvWriter = createCsvWriter({
      path: filename,
      header: [
        { id: "id", title: "ID" },
        { id: "borrower", title: "Borrower" },
        { id: "title", title: "Book Title" },
        { id: "borrow_date", title: "Borrow Date" },
        { id: "due_date", title: "Due Date" },
        { id: "return_date", title: "Return Date" },
      ],
    });

    await csvWriter.writeRecords(data);
    return filename;
  }

}

module.exports = new BookService();
