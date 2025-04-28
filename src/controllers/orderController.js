import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { User } from "../models/userModel.js";
export const createOrder = async (req, res) => {
  const { orderId, userId, orderTotal, orderItems } = req.body;
  if (!orderId || !userId || !orderTotal || !orderItems) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const checkExistingUser = await User.findById(userId);
  if (!checkExistingUser) {
    return res.status(400).json({ message: "User not found" });
  }
  //checking if the product stock is available and decreasing the stock
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    if (product.productStock < item.quantity) {
      return res
        .status(400)
        .json({ message: "Product stock is not available" });
    }
    product.productStock -= item.quantity;
    await product.save();
  }

  const orderDate = new Date();
  const orderStatus = "pending";
  const order = await Order.create({
    orderId,
    userId,
    orderDate,
    orderStatus,
    orderTotal,
    orderItems,
  });
  res.status(201).json(order);
};

export const getOrdersbyUserId = async (req, res) => {
  const { id } = req.params;
  const checkExistingUser = await User.findById(id);
  if (!checkExistingUser) {
    return res.status(400).json({ message: "User not found" });
  }
  const orders = await Order.find({ userId: id });
  const orderSortedByDate = orders.sort((a, b) => {
    return new Date(b.orderDate) - new Date(a.orderDate);
  });
  res.status(200).json(orderSortedByDate);
};

export const CancelOrder = async (req, res) => {
  try {
    const { orderId } = req.prams;
    if (!orderId) {
      res.status(400).json({ message: "order ID not found" });
    }
    const order = Order.findByIdAndUpdate(
      orderId,
      { orderStatus: "cancelled" },
      { new: true }
    );
    res.status(200).json({ message: "order cancelled sucessfully !", order });
  } catch (error) {
    console.log("error in cancelling the order", error);
    res.status(500).json({ message: "Server Busy" });
  }
};
