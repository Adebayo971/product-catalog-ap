import cartModel from "../models/cartModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

// CREATE ORDER - Checkout from cart
export const createOrder = async (req, res) => {
  try {
    const { address } = req.body;

    // 1. Get cart
    const cart = await cartModel.findOne({ user: req.user.id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty, add products first" });
    }

    // 2. Build order items with SNAPSHOT price
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price, // snapshot: copy current price
    }));

    // 3. Calculate total: sum(quantity * snapshot price)
    const totalPrice = orderItems.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);

    // 4. Create order
    const order = await orderModel.create({
      user: req.user.id,
      items: orderItems,
      totalPrice,
      address,
      status: "pending",
    });

    // 5. Reduce stock for each product
    for (const item of cart.items) {
      const product = await productModel.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    // 6. Clear cart (your logic - don't reorder again)
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Order created", data: order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ user: req.user.id }).populate("items.product", "name images").sort({ createdAt: -1 });
    res.status(200).json({ message: "My orders", total: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id).populate("items.product", "name images");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your order" });
    }
    res.status(200).json({ message: "Order found", data: order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};