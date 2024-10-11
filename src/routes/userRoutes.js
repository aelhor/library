const express = require("express");
const userController = require("../controllers/userController");

const verifyToken = require("../middlewares/authMiddleware");
const validationService = require("../middlewares/validationMiddleware");

const router = express.Router();

router.post(
  "/signup",
  validationService.validateSchema(validationService.getUserSchema()),
  (req, res, next) => userController.signup(req, res, next)
);

router.post(
  "/login",
  validationService.validateSchema(validationService.getLoginSchema()),
  (req, res, next) => userController.login(req, res, next)
);

router.patch(
  "/:id",
  validationService.validateSchema(validationService.getPartialUserSchema()),
  (req, res, next) => userController.updateUser(req, res, next)
);

router.delete("/me", verifyToken, (req, res, next) =>
  userController.deleteUser(req, res, next)
);

router.get("/", (req, res, next) => userController.getAllUsers(req, res, next));

module.exports = router;
