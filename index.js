import dns from "dns";
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import "./models/userModel.js";
import "./models/productModel.js";
import "./models/cartModel.js";
import "./models/orderModel.js";
import authRoutes from "./routes/authRoute.js";
import productRoutes from "./routes/productRoute.js";
import cartRoutes from "./routes/cartRoute.js";
import orderRoutes from "./routes/orderRoute.js";



dotenv.config();

const app = express();
app.use(cors()); // Allow frontend/mobile to call API from different domain
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Product Catalog API is live!", docs: "Use /api/auth, /api/products" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT;
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected - Atlas Product Catalog");
    app.listen(PORT, () => console.log(`Server on ${PORT}`));
  })
  .catch((err) => console.log("MongoDB fail", err.message));