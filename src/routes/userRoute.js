import express from "express";
import {
  loggoutUser,
  loginUser,
  registerUser,
  deleteUserByEmail,
} from "../controllers/authController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", loggoutUser);
userRouter.post("/delete", deleteUserByEmail);
export default userRouter;
