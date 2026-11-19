import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // snapshot price at time of order
    }
  ],
  totalPrice: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },
}, { timestamps: true });

const orderModel = mongoose.model("Order", orderSchema);
export default orderModel;