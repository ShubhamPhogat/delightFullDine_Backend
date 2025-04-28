import express from "express";
const productRouter = express.Router();
import multer from "multer";
import {
  createProduct,
  deleteProduct,
  getAllProductsByCategory,
  getProductById,
  productsMatchingPrefixSearch,
  productsMatchingTag,
  updateProduct,
} from "../controllers/productController.js";
const storage = multer.memoryStorage();
const upload = multer({ storage });

productRouter.post("/create", upload.single("productImage"), createProduct);
productRouter.get("/:category", getAllProductsByCategory);
productRouter.put("/", updateProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.get("/:productId", getProductById);
productRouter.get("/:search", productsMatchingPrefixSearch);
productRouter.get("/:id", productsMatchingTag);

export default productRouter;
