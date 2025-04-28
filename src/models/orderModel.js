//make mode for order

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  orderStatus: {
    type: String,
    default: "pending",
  },
  orderTotal: {
    type: Number,
    required: true,
  },
  orderItems: {
    type: Array,
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
