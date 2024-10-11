const express = require("express");
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/booksRoutes");
const borrowingsRoutes = require("./routes/borrowingsRouter");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");

class App {
  constructor() {
    this.app = express();
    this.setMiddlewares();
    this.setRoutes();
    this.handelErrors();
  }

  // Set up middlewares
  setMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cors()); // Enable CORS
  }

  // Set up routes
  setRoutes() {
    this.app.use("/users", userRoutes);
    this.app.use("/books", bookRoutes);
    this.app.use("/borrowings", borrowingsRoutes);
  }

  handelErrors() {
    // Handle 404 errors
    this.app.all("*", (req, res, next) => {
      next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });

    // Global error handling middleware
    this.app.use(errorHandler);
  }

  // Start the server
  listen(port) {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}

module.exports = new App();
