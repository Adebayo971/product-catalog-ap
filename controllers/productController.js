import { cloudinary } from "../config/cloudinary.js";
import productModel from "../models/productModel.js";

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = async (file) => {
  // Convert buffer to base64 data URI - Cloudinary accepts this directly
  const base64 = file.buffer.toString("base64");
  const dataURI = `data:${file.mimetype};base64,${base64}`;
  
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: "product-catalog",
  });
  return result;
};

// CREATE PRODUCT WITH MULTIPLE IMAGES
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload at least 1 image" });
    }

    const uploadPromises = req.files.map((file) => uploadToCloudinary(file));
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((result) => result.secure_url);

    const product = await productModel.create({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      images: imageUrls,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Product created", data: product });
  } catch (err) {
    console.log("FULL ERROR:", err);
  console.log("STACK:", err.stack);
  res.status(500).json({ message: err.message });
  }
};

// GET ALL PRODUCTS
export const getAllProducts = async (req, res) => {
  try {
    // 1. Get query params from URL: ?search=【entity-Nike¦canonical_name=Nike】&category=Shoes&page=1&limit=10
    const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    // 2. Build filter object
    let filter = {};

    // Search: name OR description contains search text (case-insensitive)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 3. Pagination math
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // 4. Get total count (for frontend pagination UI)
    const total = await productModel.countDocuments(filter);

    // 5. Get products with filter + pagination
    const products = await productModel
      .find(filter)
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      message: "All products",
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id).populate("createdBy", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product found", data: product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not owner of this product" });
    }

    await productModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};