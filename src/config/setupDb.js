const pool = require("./db");

const createTables = async () => {
  try {
    const booksTableQuery = `
    CREATE TABLE IF NOT EXISTS Book (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(255) UNIQUE NOT NULL,
        quantity INT NOT NULL,
        shelf_location VARCHAR(255) NOT NULL );
    `;

    const usersTableQuery = `
    CREATE TABLE IF NOT EXISTS "User" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    const borrowingTableQuery = `
    CREATE TABLE IF NOT EXISTS Borrowing (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES "User"(id) ON DELETE CASCADE,
        book_id INT REFERENCES Book(id) ON DELETE CASCADE,
        borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP,
        return_date TIMESTAMP )
    `;

    const bookIndexsQuery = `
    CREATE INDEX IF NOT EXISTS idx_book_title ON Book (title);
    CREATE INDEX IF NOT EXISTS idx_book_author ON Book (author);
    `;

    const borrowingIndexsQuery = `
    CREATE INDEX IF NOT EXISTS idx_borrowing_user_id ON borrowing (user_id);
    CREATE INDEX IF NOT EXISTS idx_borrowing_book_id ON borrowing (book_id);
    CREATE INDEX IF NOT EXISTS idx_borrowing_return_date ON borrowing (return_date);`;

    // Execute the queries to create the tables
    await pool.query(booksTableQuery);
    await pool.query(bookIndexsQuery);
    await pool.query(usersTableQuery);
    await pool.query(borrowingTableQuery);
    await pool.query(borrowingIndexsQuery);


    console.log("Tables created successfully or already exist.");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

// Call the function to create the tables
createTables();
