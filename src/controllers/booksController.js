const bookService = require("../services/bookService");

class BookController {
  async getAllBooks(req, res, next) {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to limit of 10

    try {
      const books = await bookService.getAllBooks(page, limit);
      res.status(200).json(books);
    } catch (error) {
      next(error);
    }
  }

  async addBook(req, res, next) {
    try {
      const book = await bookService.addBook(req.body);
      res.status(201).json(book);
    } catch (error) {
      next(error);
    }
  }

  async replaceBook(req, res, next) {
    const { id } = req.params;
    try {
      const updatedBook = await bookService.replaceBook(id, req.body);
      res.status(200).json(updatedBook);
    } catch (error) {
      next(error);
    }
  }

  async updateBook(req, res, next) {
    const { id } = req.params;
    try {
      const updatedBook = await bookService.updateBook(id, req.body);
      res.status(200).json(updatedBook);
    } catch (error) {
      next(error);
    }
  }

  async deleteBook(req, res, next) {
    const { id } = req.params;
    try {
      const deletedBook = await bookService.deleteBook(id);
      res
        .status(200)
        .json({ message: "Book deleted successfully", deletedBook });
    } catch (error) {
      next(error);
    }
  }

  async searchBooks(req, res, next) {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to limit of 10

    try {
      const books = await bookService.searchBooks(req.query, page, limit);
      res.status(200).json(books);
    } catch (error) {
      //   res.status(400).json({ error: error.message });
      next(error);
    }
  }
}

module.exports = new BookController();
