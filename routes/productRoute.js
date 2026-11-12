import express from "express";
import { createProduct, getAllProducts, getProductById, deleteProduct } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Create product - protect + multiple images (max 5)
router.post("/create", protect, upload.array("images", 5), createProduct);

// Get all - public, no token needed
router.get("/", getAllProducts);

// Get single - public
router.get("/:id", getProductById);

// Delete - protect + only owner
router.delete("/:id", protect, deleteProduct);

export default router;