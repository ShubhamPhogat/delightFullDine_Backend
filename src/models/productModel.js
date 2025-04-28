//make a product model
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  productCategory: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    required: true,
  },
  productStock: {
    type: Number,
    default: 1,
  },
  productTags: {
    type: [String],
    default: [],
  },
});

const Product = mongoose.model("Product", productSchema);

export default Product;
