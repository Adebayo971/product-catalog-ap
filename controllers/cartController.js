import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // 1. Check product exists
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 2. Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} in stock` });
    }

    // 3. Find cart for this user, or create if none
    let cart = await cartModel.findOne({ user: req.user.id });
    if (!cart) {
      cart = await cartModel.create({ user: req.user.id, items: [] });
    }

    // 4. Check if product already in cart (your logic!)
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // YES -> increase quantity, not duplicate
      existingItem.quantity += quantity;
    } else {
      // NO -> add new item
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    // Populate to show product details, not just IDs
    await cart.populate("items.product", "name price images");

    res.status(200).json({ message: "Added to cart", data: cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY CART
export const getCart = async (req, res) => {
  try {
    const cart = await cartModel.findOne({ user: req.user.id }).populate("items.product", "name price images");
    if (!cart) return res.status(200).json({ message: "Cart is empty", data: { items: [], total: 0 } });

    // Calculate total: sum(quantity * price)
    const total = cart.items.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;
    }, 0);

    res.status(200).json({ message: "My cart", total, data: cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REMOVE FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await cartModel.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Filter out the product to remove
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: "Removed from cart", data: cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};