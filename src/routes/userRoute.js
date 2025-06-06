import express from "express";
import {
  logoutUser,
  loginUser,
  registerUser,
  deleteUserByEmail,
} from "../controllers/authController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/delete", deleteUserByEmail);
export default userRouter;
