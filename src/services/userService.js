const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

class UserService {
  async registerUser(userData) {
    const { name, email, password } = userData;

    // Check if user already exists
    const userExists = await pool.query(
      `SELECT * FROM "User" WHERE email = $1`,
      [email]
    );
    if (userExists.rows.length > 0) {
      throw new Error("User already exists");
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const query = `INSERT INTO "User" (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
    const values = [name, email, hashedPassword];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  async loginUser(email, password) {
    // Find the user by email
    const user = await pool.query(`SELECT * FROM "User" WHERE email = $1`, [
      email,
    ]);
    if (user.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const foundUser = user.rows[0];

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }
    delete foundUser['password']
    console.log(process.env.JWT_SECRET)
    // Generate a JWT token
    const token = jwt.sign({ userId: foundUser.id }, process.env.JWT_SECRET,);

    return { token, user: foundUser };
  }

  async updateUser(id, userData) {
    const fields = [];
    const values = [];

    // Check if password is being updated
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      fields.push("password = $" + (fields.length + 1));
      values.push(hashedPassword);
    }

    if (userData.name) {
      fields.push("name = $" + (fields.length + 1));
      values.push(userData.name);
    }

    if (userData.email) {
      fields.push("email = $" + (fields.length + 1));
      values.push(userData.email);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided for update");
    }

    // Add the user ID to the values array for the WHERE clause
    values.push(id);

    // Construct the dynamic query
    const query = `
      UPDATE "User"
      SET ${fields.join(", ")} 
      WHERE id = $${fields.length + 1} RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  }

  async deleteUser(id) {
    const query = 'DELETE FROM "User" WHERE id = $1 RETURNING *;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  }

  async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit; // Calculate the offset for pagination

    const result = await pool.query(
      'SELECT id, name, email,registered_at FROM "User"  LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }
}

module.exports = new UserService();
