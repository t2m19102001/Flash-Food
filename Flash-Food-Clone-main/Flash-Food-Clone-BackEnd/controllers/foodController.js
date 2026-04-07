import foodModel from "../models/foodModel.js";
import fs from "fs";

//add food item
export const addFood = async (req, res) => {
    let image_filename = req.file ? `${req.file.filename}` : "default.png";
    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename
    });
    try {
        await food.save();
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
// all food list
export const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, foods: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
// remove food list
export const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);

        if (food && food.image && food.image !== "default.png") {
            fs.unlink(`uploads/${food.image}`, (err) => {
                if (err) console.log("File not found, but continuing to delete record");
            });
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// toggle food availability
export const toggleAvailability = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        food.isAvailable = !food.isAvailable;
        await food.save();

        res.json({
            success: true,
            message: `Food ${food.isAvailable ? "enabled" : "disabled"}`,
            isAvailable: food.isAvailable
        });
    } catch (error) {
        console.error("Error toggling availability:", error);
        res.json({ success: false, message: "Error toggling availability" });
    }
}

// update food
export const updateFood = async (req, res) => {
    try {
        const foodId = req.body.id;
        const food = await foodModel.findById(foodId);

        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        // Update fields
        food.name = req.body.name;
        food.description = req.body.description;
        food.price = req.body.price;
        food.category = req.body.category;

        // If new image uploaded, delete old image and update
        if (req.file) {
            // Delete old image if exists
            if (food.image && food.image !== "default.png") {
                fs.unlink(`uploads/${food.image}`, (err) => {
                    if (err) console.log("Old file not found");
                });
            }
            food.image = req.file.filename;
        }

        await food.save();
        res.json({ success: true, message: "Food Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating food" });
    }
}

