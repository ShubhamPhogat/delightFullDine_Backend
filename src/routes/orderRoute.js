import express from "express";
import {
  createOrder,
  getOrdersbyUserId,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/create", createOrder);
orderRouter.get("/get/:id", getOrdersbyUserId);

export default orderRouter;
