const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");

const authRouter = Router();

/** @route POST /api/auth/register — Public */
authRouter.post("/register", authController.registerUserController);

/** @route POST /api/auth/login — Public */
authRouter.post("/login", authController.loginUserController);

/** @route GET /api/auth/logout — Public */
authRouter.get("/logout", authController.logoutUserController);

/** @route GET /api/auth/me — Private */
authRouter.get("/me", authUser, authController.getMeController);

/** @route PUT /api/auth/profile — Private */
authRouter.put("/profile", authUser, authController.updateProfileController);

/** @route POST /api/auth/forgot-password — Public */
authRouter.post("/forgot-password", authController.forgotPasswordController);

/** @route POST /api/auth/reset-password — Public */
authRouter.post("/reset-password", authController.resetPasswordController);

/** @route PUT /api/auth/change-password — Private */
authRouter.put(
  "/change-password",
  authUser,
  authController.changePasswordController,
);

module.exports = authRouter;
