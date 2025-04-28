import cloudinary from "../cloudinary.js";
import Product from "../models/productModel.js";

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
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productCategory ||
      !productStock ||
      !productTags
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //adding image to cloudinary
    const base64str = req.file.buffer.toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + base64str;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "products",
    });

    console.log(result.secure_url);
    const product = await Product.create({
      productName,
      productDescription,
      productPrice,
      productCategory,
      productImage: result.secure_url,
      productStock,
      productTags,
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
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }
    const product = await Product.findById(id);
    const currentProductId = product._id;
    const matchingTags = product.productTags;
    const pipeline = [
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(currentProductId) }, // exclude the current product
          tags: { $in: matchingTags },
        },
      },
      {
        $addFields: {
          matchedTagsCount: {
            $size: {
              $setIntersection: ["$tags", matchingTags], // count how many tags match
            },
          },
        },
      },
      {
        $sort: { matchedTagsCount: -1 }, // higher matched count comes first
      },
    ];
    const products = await Product.aggregate(pipeline);
    res.status(200).json(products);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};
