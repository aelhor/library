const pool = require("../../config/db");
const BookService = require("../bookService");
const AppError = require("../../utils/AppError");

// Mock the database connection
jest.mock("../../config/db");

describe("BookService", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks before each test
  });

  it("should get all books", async () => {
    // Mock the pool.query response
    const mockBooks = [
      { id: 1, title: "Book 1" },
      { id: 2, title: "Book 2" },
    ];
    pool.query.mockResolvedValueOnce({ rows: mockBooks });

    const books = await BookService.getAllBooks();

    expect(books).toEqual(mockBooks);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM Book ORDER BY title LIMIT $1 OFFSET $2",
      [10, 0] // Default limit and offset
    );
  });

  it("should add a new book", async () => {
    const mockBookData = {
      title: "New Book",
      author: "Author",
      isbn: "1234567890",
      quantity: 5,
      shelf_location: "A1",
    };
    const mockResponse = { id: 1, ...mockBookData };

    // Mock the pool.query response
    pool.query.mockResolvedValueOnce({ rows: [mockResponse] });

    const result = await BookService.addBook(mockBookData);

    expect(result).toEqual(mockResponse);
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO Book (title, author, isbn, quantity, shelf_location) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        mockBookData.title,
        mockBookData.author,
        mockBookData.isbn,
        mockBookData.quantity,
        mockBookData.shelf_location,
      ]
    );
  });

  it("should update a book", async () => {
    const mockBookData = { title: "Updated Book", author: "Updated Author" };
    const mockResponse = { id: 1, ...mockBookData };

    // Mock the pool.query response
    pool.query.mockResolvedValueOnce({ rows: [mockResponse] });

    const result = await BookService.updateBook(1, mockBookData);

    expect(result).toEqual(mockResponse);
    expect(pool.query).toHaveBeenCalled(); // Ensure the query was called
  });

  it("should throw an error if trying to update a non-existent book", async () => {
    const mockBookData = { title: "Updated Book" };

    // Mock the pool.query response
    pool.query.mockResolvedValueOnce({ rows: [] }); // No record found

    await expect(BookService.updateBook(999, mockBookData)).rejects.toThrow(
      "Book not found"
    );
  });

  it("should delete a book", async () => {
    const mockResponse = { id: 1, title: "Book to delete" };

    // Mock the pool.query response
    pool.query.mockResolvedValueOnce({ rows: [mockResponse] });

    const result = await BookService.deleteBook(1);

    expect(result).toEqual(mockResponse);
    expect(pool.query).toHaveBeenCalledWith(
      "DELETE FROM Book WHERE id = $1 RETURNING *;",
      [1]
    );
  });

  it("should throw an error if trying to delete a non-existent book", async () => {
    // Mock the pool.query response
    pool.query.mockResolvedValueOnce({ rows: [] }); // No record found

    await expect(BookService.deleteBook(999)).rejects.toThrow("Book not found");
  });

  it("should search for books by title", async () => {
    const queryParams = { title: "Book" };
    const mockBooks = [
      { id: 1, title: "Book 1" },
      { id: 2, title: "Book 2" },
    ];

    // Mock the pool.query response
    pool.query.mockResolvedValueOnce({ rows: mockBooks });

    const result = await BookService.searchBooks(queryParams);

    expect(result).toEqual(mockBooks);
    expect(pool.query).toHaveBeenCalled(); // Ensure the query was called
  });

  it("should throw an error if no search parameters provided", async () => {
    await expect(BookService.searchBooks({})).rejects.toThrow(
      "No search parameters provided"
    );
  });

  it("should get a book by ID", async () => {
    const mockResponse = { id: 1, title: "Book 1" };

    // Mock the pool.query response
    pool.query.mockResolvedValueOnce({ rows: [mockResponse] });

    const result = await BookService.getBookById(1);

    expect(result).toEqual(mockResponse);
  });

  it("should throw an error if book not found", async () => {
    // Mock the pool.query response to simulate a book not found
    pool.query.mockResolvedValueOnce({ rows: [] }); // No record found

    await expect(BookService.getBookById(999)).rejects.toThrow(AppError);
    await expect(BookService.getBookById(999)).rejects.toHaveProperty(
      "message",
      "Book not found"
    );
  });

  it("should check book availability", async () => {
    // Mock the pool.query response
    pool.query.mockResolvedValueOnce({ rows: [] }); // No borrowing records found

    await expect(BookService.checkBookAvailablty(1)).resolves.not.toThrow();
  });

  it("should throw an error if the book is already borrowed", async () => {
    // Mock the pool.query response
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Book is borrowed

    await expect(BookService.checkBookAvailablty(1)).rejects.toThrow(
      "Book is already checked out by another borrower"
    );
  });
});
