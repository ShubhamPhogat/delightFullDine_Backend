import express from "express";
const productRouter = express.Router();
import multer from "multer";
import {
  addToWishlist,
  createProduct,
  deleteProduct,
  getAllProducts,
  getAllProductsByCategory,
  getProductById,
  getWishlist,
  productsMatchingPrefixSearch,
  productsMatchingTag,
  removeFromWishlist,
  updateProduct,
} from "../controllers/productController.js";
const storage = multer.memoryStorage();
const upload = multer({ storage });

productRouter.post("/create", upload.single("productImage"), createProduct);
productRouter.get("/all", getAllProducts);
productRouter.get("category/:category", getAllProductsByCategory);
productRouter.put("/", updateProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.get("/findById/:productId", getProductById);
productRouter.get("/search/:search", productsMatchingPrefixSearch);
productRouter.get("/matching/:id", productsMatchingTag);
productRouter.post("/addToCart", addToWishlist);
productRouter.get("/getCart/:userId", getWishlist);
productRouter.post("/removeToCart", removeFromWishlist);

export default productRouter;
