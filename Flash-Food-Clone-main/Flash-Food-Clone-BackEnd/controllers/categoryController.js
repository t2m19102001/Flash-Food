import categoryModel from "../models/categoryModel.js";

// Add category
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file ? req.file.filename : "";

        const exists = await categoryModel.findOne({ name });
        if (exists) {
            return res.json({ success: false, message: "Category already exists" });
        }

        const category = new categoryModel({
            name,
            image,
            managedBy: req.userId
        });

        await category.save();
        res.json({ success: true, message: "Category added", category });
    } catch (error) {
        console.error("Error adding category:", error);
        res.json({ success: false, message: "Error adding category" });
    }
};

// List all categories
const listCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        res.json({ success: true, categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.json({ success: false, message: "Error fetching categories" });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id, name } = req.body;
        const updateData = { name };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const category = await categoryModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!category) {
            return res.json({ success: false, message: "Category not found" });
        }

        res.json({ success: true, message: "Category updated", category });
    } catch (error) {
        console.error("Error updating category:", error);
        res.json({ success: false, message: "Error updating category" });
    }
};

// Remove category
const removeCategory = async (req, res) => {
    try {
        const { id } = req.body;
        const category = await categoryModel.findByIdAndDelete(id);
        if (!category) {
            return res.json({ success: false, message: "Category not found" });
        }

        res.json({ success: true, message: "Category removed" });
    } catch (error) {
        console.error("Error removing category:", error);
        res.json({ success: false, message: "Error removing category" });
    }
};

export { addCategory, listCategories, updateCategory, removeCategory };
