import mongoose from "mongoose";
import cloudinary from "../cloudinary.js";
import Product from "../models/productModel.js";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/userModel.js";

export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      productPrice,
      productCategory,
      productStock,
      productTags,
    } = req.body;
    console.log(
      "adding item",
      productName,
      productPrice,
      productCategory,
      productStock,
      productTags
    );
    if (
      !productName ||
      !productPrice ||
      !productCategory ||
      !productStock ||
      !productTags
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    console.log(
      "adding item",
      productName,
      productPrice,
      productCategory,
      productStock,
      productTags
    );
    //adding image to cloudinary
    const base64str = req.file.buffer.toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + base64str;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "products",
    });

    console.log(result.secure_url);
    let tags = productTags;

    if (typeof tags === "string") {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        return res.status(400).json({ message: "Invalid productTags format" });
      }
    }

    // Optional: check that tags is an array
    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: "productTags must be an array" });
    }
    const product = await Product.create({
      productId: uuidv4(),
      productName,
      productDescription: "",
      productPrice,
      productCategory,
      productImage: result.secure_url,
      productStock,
      productTags: tags,
    });
    res.status(201).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    const products = await Product.find({ productCategory: category });
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      productId,
      productName,
      productDescription,
      productPrice,
      productCategory,
      productStock,
      productTags,
    } = req.body;
    if (
      !productId ||
      !productName ||
      !productDescription ||
      !productPrice ||
      !productCategory ||
      !productStock ||
      !productTags
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const product = await Product.findByIdAndUpdate(productId, {
      productName,
      productDescription,
      productPrice,
      productCategory,
      productStock,
      productTags,
    });
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function deleteImageByUrl(url) {
  try {
    // 1. Extract the public_id
    const parts = url.split("/");
    const fileName = parts[parts.length - 1]; // e.g., my_image_name.jpg
    const folderPath = parts
      .slice(parts.indexOf("upload") + 1, parts.length - 1)
      .join("/"); // folder if any
    const publicIdWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const public_id = folderPath
      ? `${folderPath}/${publicIdWithoutExt}`
      : publicIdWithoutExt;

    console.log("Deleting public_id:", public_id);

    // 2. Delete using Cloudinary SDK
    const result = await cloudinary.uploader.destroy(public_id);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    const product = await Product.findById(productId);
    if (product.productImage) {
      await deleteImageByUrl(product.productImage);
    }
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    const product = await Product.findById(productId);
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
  }
};

export const productsMatchingPrefixSearch = async (req, res) => {
  try {
    const { search } = req.params;
    if (!search) {
      return res.status(400).json({ message: "Search is required" });
    }
    const products = await Product.find({
      productName: { $regex: `^${search}`, $options: "i" },
    });
    res.status(200).json(products);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const productsMatchingTag = async (req, res) => {
  try {
    console.log("hit");
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    // Find the product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const currentProductId = product._id;
    const matchingTags = product.productTags;

    // Check if productTags array exists and has items
    if (
      !matchingTags ||
      !Array.isArray(matchingTags) ||
      matchingTags.length === 0
    ) {
      return res.status(200).json([]); // Return empty array if no tags to match
    }

    // Fixed aggregation pipeline
    const pipeline = [
      {
        $match: {
          _id: { $ne: currentProductId }, // Exclude the current product
          productTags: { $in: matchingTags }, // Look for products with any matching tag
        },
      },
      {
        $addFields: {
          matchedTagsCount: {
            $size: {
              $setIntersection: ["$productTags", matchingTags], // Count how many tags match
            },
          },
        },
      },
      {
        $sort: { matchedTagsCount: -1 }, // Higher matched count comes first
      },
      {
        $limit: 10, // Limit to 10 similar products for performance
      },
    ];

    const products = await Product.aggregate(pipeline);

    console.log(
      `Found ${products.length} similar products for product ID: ${id}`
    );
    res.status(200).json(products);
  } catch (e) {
    console.error("Error in productsMatchingTag:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find();
    res.status(200).json({ allProducts, message: "200" });
  } catch (error) {
    console.error("Fetch error:", error); // Add error log
    res.status(500).json({ message: "Server error in fetching the products" });
  }
};

// *********************************WISHlIST FUNCITONS ****************************************************

export const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    console.log("Adding to wishlist", userId, productId);

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "UserId and productId are required" });
    }

    // Convert productId to ObjectId if it's a string
    let productObjectId;
    try {
      productObjectId = new mongoose.Types.ObjectId(productId);
    } catch (err) {
      return res.status(400).json({ message: "Invalid productId format" });
    }

    // First check if the product already exists in the wishlist
    const user = await User.findOne({
      _id: userId,
      "wishList.productId": productObjectId,
    });

    let updatedUser;

    if (user) {
      // Product exists, increment the quantity
      updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          "wishList.productId": productObjectId,
        },
        {
          $inc: { "wishList.$.quantity": 1 },
        },
        {
          new: true,
        }
      );
    } else {
      // Product doesn't exist, add it
      updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          $addToSet: {
            wishList: {
              productId: productObjectId,
              quantity: 1,
            },
          },
        },
        {
          new: true,
          runValidators: false,
        }
      );
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated wishlist:", updatedUser.wishList);
    console.log("done");

    res.status(200).json({
      message: "Product added to wishlist",
      wishlist: updatedUser.wishList,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("geting wishlist", userId);
    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // Find user and populate product information
    const user = await User.findById(userId).populate({
      path: "wishList.productId",
      model: "Product", // Replace with your actual Product model name
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Wishlist retrieved successfully",
      wishlist: user.wishList,
    });
  } catch (error) {
    console.error("Error getting wishlist:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({ message: "UserId and productId are required" });
    }

    // Convert productId to ObjectId if it's a string
    let productObjectId;
    try {
      productObjectId = new mongoose.Types.ObjectId(productId);
    } catch (err) {
      return res.status(400).json({ message: "Invalid productId format" });
    }

    // First find the user and the specific wishlist item
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the wishlist item
    const wishlistItem = user.wishList.find((item) =>
      item.productId.equals(productObjectId)
    );

    if (!wishlistItem) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    let updatedUser;
    if (wishlistItem.quantity > 1) {
      // Decrement quantity if more than 1
      updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          "wishList.productId": productObjectId,
        },
        {
          $inc: { "wishList.$.quantity": -1 },
        },
        {
          new: true,
        }
      );
    } else {
      // Remove the item if quantity is 1
      updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          $pull: {
            wishList: { productId: productObjectId },
          },
        },
        {
          new: true,
        }
      );
    }

    res.status(200).json({
      message:
        wishlistItem.quantity > 1
          ? "Product quantity decremented in wishlist"
          : "Product removed from wishlist",
      wishlist: updatedUser.wishList,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Remove item completely from wishlist
