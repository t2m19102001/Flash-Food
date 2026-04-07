import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }
}, { timestamps: true });

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;
