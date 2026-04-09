import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 4.5 },
  address: { type: String, default: "" }
}, { timestamps: true });

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;