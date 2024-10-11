const Ajv = require("ajv");
const addFormats = require("ajv-formats");

class ValidationService {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv); // Add formats such as email validation
  }

  // Method to validate schema
  validateSchema(schema) {
    return (req, res, next) => {
      const validate = this.ajv.compile(schema);
      const valid = validate(req.body);

      if (!valid) {
        // If validation fails, return the errors
        return res.status(400).json({ errors: validate.errors });
      }

      // If valid, continue to the next middleware
      next();
    };
  }

  // Method to create dynamic schema for partial updates (PATCH)
  createPartialSchema(fullSchema) {
    // Clone the original schema but remove the required fields for partial updates
    const partialSchema = { ...fullSchema };
    delete partialSchema.required; // Remove the required field constraint for PATCH
    return partialSchema;
  }

  // Full schema for signup
  getUserSchema() {
    return {
      type: "object",
      properties: {
        name: { type: "string", minLength: 3, maxLength: 50 },
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 },
      },
      required: ["name", "email", "password"],
      additionalProperties: false,
    };
  }

  getLoginSchema() {
    return {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string" },
      },
      required: ["email", "password"],
      additionalProperties: false,
    };
  }

  // Full schema for book creation
  getBookSchema() {
    return {
      type: "object",
      properties: {
        title: { type: "string", minLength: 3, maxLength: 255 },
        author: { type: "string", minLength: 3, maxLength: 255 },
        isbn: { type: "string", pattern: "^[0-9]{10,13}$" }, // ISBN should be 10-13 digits
        quantity: { type: "integer", minimum: 1 }, // Quantity must be a positive integer
        shelf_location: { type: "string", minLength: 1, maxLength: 50 },
      },
      required: ["title", "author", "isbn", "quantity", "shelf_location"],
      additionalProperties: false,
    };
  }

  // Schema for partial book update (PATCH)
  getPartialBookSchema() {
    return this.createPartialSchema(this.getBookSchema()); // No required fields
  }

  getPartialUserSchema() {
    return this.createPartialSchema(this.getUserSchema()); // No required fields
  }

  getCheckOutSchema() {
    return {
      type: "object",
      properties: {
        bookId: { type: "number" },
      },
      required: ["bookId"],
      additionalProperties: false,
    };
  }
  getRetunBookSchema() {
    return {
      type: "object",
      properties: {
        borrowingId: { type: "number" },
      },
      required: ["borrowingId"],
      additionalProperties: false,
    };
  }
}

module.exports = new ValidationService();
