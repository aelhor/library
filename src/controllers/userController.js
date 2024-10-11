const userService = require("../services/userService");

class UserController {
  async signup(req, res, next) {
    try {
      const user = await userService.registerUser(req.body);
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    const { email, password } = req.body;

    try {
      const { token, user } = await userService.loginUser(email, password);
      res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    const { id } = req.params;
    try {
      const updatedUser = await userService.updateUser(id, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    const { id } = req.params;
    try {
      const deletedUser = await userService.deleteUser(id);
      res
        .status(200)
        .json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const users = await userService.getAllUsers(page, limit);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
