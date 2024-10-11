# Library Management System

A simple library management system built using Node.js, Express, PostgreSQL, and various libraries to manage books and borrowing processes effectively. This application allows users to manage book information, track borrowing activities, and generate reports.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Unit Testing](#unit-testing)
- [Rate Limiting](#rate-limiting)

## Features

- Add, update, delete, and search for books.
- Borrow and return books with tracking.
- Generate analytical reports for borrowing activities.
- Basic Authentication
- Export overdue and borrowing data as CSV files.
- Basic rate limiting for selected API endpoints.
- Unit testing for core functionalities.

## Technologies Used

- **Node.js**: JavaScript
- **Express**: Framework for Node.js.
- **PostgreSQL**: Relational database management system.
- **Jest**: JavaScript testing framework.
- **CSV Writer**: Library to generate CSV files.
- **Express Rate Limit**: Middleware for rate limiting requests.

## Installation

1. Clone the repository:

```bash
   git clone <https://github.com/aelhor/library.git>
   cd library-management-system
```

2. Install dependencies:

```bash
   npm install
```

3. Set up your PostgreSQL database:

Create a database for the application.
Update your database connection settings in src/config/db.js.

4. Create a .env file in the root directory and add your environment variables:
   [.env example](./env%20example)

## Usage

- Local environment

  Start the application:

```bash
npm start
```

Start in watch mode using nodemon

```bash
npm run dev
```

The server will run on http://localhost:3000

- Using Docker
  1. Add this to .env variable

```js
DB_USER = postgres;
DB_HOST = db;
DB_NAME = library;
DB_PASSWORD = password;
DB_PORT = 5432;
```
  2. build images and containers

```bash
docker-compose up
```

## API Endpoints

[Postmen Collection](https://documenter.getpostman.com/view/25931805/2sAXxS7r7H)

- Book Endpoints
  GET /books: Retrieve all books (supports pagination).
  POST /books: Add a new book.
  PATCH /books/ : Update a book's details.
  DELETE /books/ : Delete a book.
  GET /books/search: Search for books by title, author, or ISBN.

- Borrowing Endpoints
  POST /borrowings/checkout: Check out a book.
  PATCH /borrowings/return: Return a borrowed book.
  GET /borrowings/overdue: Retrieve overdue books (supports pagination).

- Reporting Endpoints
  GET /books/export/overdue/csv: Export overdue borrows to CSV.
  GET /books/reports: Generate borrowing reports for a specific period.

## Unit Testing

To run the unit tests for the application:

```bash
    npm test
```

This will execute all tests and provide coverage information.

## Rate Limiting

Rate limiting is implemented on the following endpoints to prevent abuse:

GET /books/export/overdue/csv
GET /books/reports
These endpoints are limited to a maximum of 10 requests per 15 minutes per IP address
