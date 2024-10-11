const pool = require("../config/db");
const AppError = require("../utils/AppError");

class BookService {
  async getAllBooks(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      "SELECT * FROM Book ORDER BY title LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  }

  async addBook(bookData) {
    const { title, author, isbn, quantity, shelf_location } = bookData;
    const query =
      "INSERT INTO Book (title, author, isbn, quantity, shelf_location) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [title, author, isbn, quantity, shelf_location];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateBook(id, bookData) {
    // Build dynamic query based on the provided fields
    const fields = [];
    const values = [];

    if (bookData.title) {
      fields.push("title = $" + (fields.length + 1));
      values.push(bookData.title);
    }

    if (bookData.author) {
      fields.push("author = $" + (fields.length + 1));
      values.push(bookData.author);
    }

    if (bookData.isbn) {
      fields.push("isbn = $" + (fields.length + 1));
      values.push(bookData.isbn);
    }

    if (bookData.quantity) {
      fields.push("quantity = $" + (fields.length + 1));
      values.push(bookData.quantity);
    }

    if (bookData.shelf_location) {
      fields.push("shelf_location = $" + (fields.length + 1));
      values.push(bookData.shelf_location);
    }

    // If no fields are provided for update, throw an error
    if (fields.length === 0) {
      throw new Error("No fields provided for update");
    }

    // Add the book ID to the values array for the WHERE clause
    values.push(id);

    // Construct the dynamic query
    const query = `
      UPDATE Book
      SET ${fields.join(", ")} 
      WHERE id = $${fields.length + 1} 
      RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Book not found");
    }

    return result.rows[0];
  }

  async replaceBook(id, bookData) {
    const { title, author, isbn, quantity, shelf_location } = bookData;

    // Update the book details in the database
    const query = `
      UPDATE Book 
      SET title = $1, author = $2, isbn = $3, quantity = $4, shelf_location = $5 
      WHERE id = $6 RETURNING *;
    `;
    const values = [title, author, isbn, quantity, shelf_location, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("Book not found");
    }

    return result.rows[0];
  }

  async deleteBook(id) {
    const query = "DELETE FROM Book WHERE id = $1 RETURNING *;";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error("Book not found");
    }

    return result.rows[0]; // Return the deleted book
  }

  async searchBooks(queryParams, page = 1, limit = 10) {
    const { title, author, isbn } = queryParams;

    let query = "SELECT * FROM Book WHERE ";
    const conditions = [];
    const values = [];

    if (title) {
      conditions.push(
        "LOWER(title) LIKE LOWER($" + (conditions.length + 1) + ")"
      );
      values.push(`%${title}%`);
    }

    if (author) {
      conditions.push(
        "LOWER(author) LIKE LOWER($" + (conditions.length + 1) + ")"
      );
      values.push(`%${author}%`);
    }

    if (isbn) {
      conditions.push("isbn = $" + (conditions.length + 1));
      values.push(isbn);
    }

    if (conditions.length === 0) {
      throw new Error("No search parameters provided");
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query +=
      conditions.join(" OR ") +
      ` ORDER BY title LIMIT $${conditions.length + 1} OFFSET $${
        conditions.length + 2
      }`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return result.rows;
  }

  async getBookById(bookId) {
    const query = "SELECT * FROM Book WHERE id = $1;";
    const result = await pool.query(query, [bookId]);

    // Ensure we correctly check for an empty result
    if (!result || result.rows.length === 0) {
      throw new AppError("Book not found", 404); // Throw 404 if book not found
    }

    return result.rows[0];
  }

  async checkBookAvailablty(bookId) {
    // Check if the book is already borrowed
    const borrowedBookCheck = await pool.query(
      "SELECT * FROM Borrowing WHERE book_id = $1 AND return_date IS NULL;", //?W
      [bookId]
    );

    if (borrowedBookCheck.rows.length > 0) {
      throw new Error("Book is already checked out by another borrower");
    }
  }

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
      throw new AppError("Unauthorized access to this borrowing record", 401); // Unauthorized error

      //   error.statusCode = 401; // Set status code for Unauthorized
      //   throw error;
    }

    return result.rows[0]; // Return the borrowing record if found
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
}

module.exports = new BookService();
