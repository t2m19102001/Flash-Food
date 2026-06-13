import foodModel from "../models/foodModel.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== HELPER: KIỂM TRA FILENAME AN TOÀN ==========
const isValidFilename = (filename) => {
    if (!filename || filename === "default.png") return false;
    
    // 🔒 Kiểm tra path traversal
    const dangerousPatterns = ['../', '..\\', './', '.\\', '%2e', '%2f', '%5c', '/', '\\'];
    for (const pattern of dangerousPatterns) {
        if (filename.includes(pattern)) {
            console.warn(`⚠️ Path traversal detected: ${filename}`);
            return false;
        }
    }
    
    // 🔒 Kiểm tra extension hợp lệ
    const ext = path.extname(filename).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (!allowedExts.includes(ext)) {
        console.warn(`⚠️ Invalid extension: ${ext}`);
        return false;
    }
    
    return true;
};

// ========== HELPER: XÓA ẢNH AN TOÀN ==========
const deleteImageSafe = (filename) => {
    return new Promise((resolve) => {
        if (!filename || filename === "default.png") {
            resolve(false);
            return;
        }
        
        if (!isValidFilename(filename)) {
            console.warn(`⚠️ Skipping deletion of invalid filename: ${filename}`);
            resolve(false);
            return;
        }
        
        // 🔥 SỬA: Dùng path.join để tạo đường dẫn tuyệt đối an toàn
        const filePath = path.join(__dirname, '../uploads', filename);
        
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.log(`File not found: ${filePath}`);
                resolve(false);
                return;
            }
            
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Error deleting file: ${filePath}`, unlinkErr);
                    resolve(false);
                } else {
                    console.log(`✅ Deleted: ${filePath}`);
                    resolve(true);
                }
            });
        });
    });
};

// ========== THÊM MÓN ĂN ==========
export const addFood = async (req, res) => {
    try {
        // Kiểm tra file upload
        if (!req.file) {
            return res.json({ success: false, message: "Vui lòng upload ảnh món ăn!" });
        }
        
        // Validate dữ liệu đầu vào
        const { name, description, price, category } = req.body;
        
        if (!name || !description || !price || !category) {
            // Xóa file đã upload nếu validate thất bại
            await deleteImageSafe(req.file.filename);
            return res.json({ success: false, message: "Vui lòng điền đầy đủ thông tin!" });
        }
        
        const image_filename = req.file.filename;
        
        const food = new foodModel({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category: category.trim(),
            image: image_filename
        });
        
        await food.save();
        
        res.json({ 
            success: true, 
            message: "Thêm món ăn thành công!",
            food: food
        });
        
    } catch (error) {
        console.error("Add food error:", error);
        
        // Xóa file đã upload nếu có lỗi
        if (req.file) {
            await deleteImageSafe(req.file.filename);
        }
        
        res.json({ 
            success: false, 
            message: error.message || "Lỗi khi thêm món ăn!" 
        });
    }
};

// ========== DANH SÁCH MÓN ĂN ==========
export const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, foods });
    } catch (error) {
        console.error("List food error:", error);
        res.json({ success: false, message: "Lỗi khi lấy danh sách món ăn!" });
    }
};

// ========== XÓA MÓN ĂN ==========
export const removeFood = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.json({ success: false, message: "Thiếu ID món ăn!" });
        }
        
        const food = await foodModel.findById(id);
        
        if (!food) {
            return res.json({ success: false, message: "Không tìm thấy món ăn!" });
        }
        
        // 🔥 SỬA: Xóa ảnh an toàn trước khi xóa record
        if (food.image && food.image !== "default.png") {
            await deleteImageSafe(food.image);
        }
        
        await foodModel.findByIdAndDelete(id);
        
        res.json({ 
            success: true, 
            message: "Xóa món ăn thành công!" 
        });
        
    } catch (error) {
        console.error("Remove food error:", error);
        res.json({ 
            success: false, 
            message: error.message || "Lỗi khi xóa món ăn!" 
        });
    }
};

// ========== BẬT/TẮT TRẠNG THÁI MÓN ĂN ==========
export const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.json({ success: false, message: "Thiếu ID món ăn!" });
        }
        
        const food = await foodModel.findById(id);
        
        if (!food) {
            return res.json({ success: false, message: "Không tìm thấy món ăn!" });
        }

        food.isAvailable = !food.isAvailable;
        await food.save();

        res.json({
            success: true,
            message: `Đã ${food.isAvailable ? "bật" : "tắt"} món ăn: ${food.name}`,
            isAvailable: food.isAvailable
        });
        
    } catch (error) {
        console.error("Toggle availability error:", error);
        res.json({ 
            success: false, 
            message: "Lỗi khi thay đổi trạng thái món ăn!" 
        });
    }
};

// ========== CẬP NHẬT MÓN ĂN ==========
export const updateFood = async (req, res) => {
    try {
        const { id, name, description, price, category } = req.body;
        
        if (!id) {
            if (req.file) {
                await deleteImageSafe(req.file.filename);
            }
            return res.json({ success: false, message: "Thiếu ID món ăn!" });
        }
        
        const food = await foodModel.findById(id);
        
        if (!food) {
            if (req.file) {
                await deleteImageSafe(req.file.filename);
            }
            return res.json({ success: false, message: "Không tìm thấy món ăn!" });
        }

        // Update fields
        if (name) food.name = name.trim();
        if (description) food.description = description.trim();
        if (price) food.price = Number(price);
        if (category) food.category = category.trim();

        // 🔥 SỬA: Xử lý ảnh mới an toàn
        if (req.file) {
            // Xóa ảnh cũ nếu có
            if (food.image && food.image !== "default.png") {
                await deleteImageSafe(food.image);
            }
            food.image = req.file.filename;
        }

        await food.save();
        
        res.json({ 
            success: true, 
            message: "Cập nhật món ăn thành công!",
            food: food
        });
        
    } catch (error) {
        console.error("Update food error:", error);
        
        if (req.file) {
            await deleteImageSafe(req.file.filename);
        }
        
        res.json({ 
            success: false, 
            message: error.message || "Lỗi khi cập nhật món ăn!" 
        });
    }
};

// ========== THÊM HÀM: LẤY MÓN ĂN THEO ID ==========
export const getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.json({ success: false, message: "Thiếu ID món ăn!" });
        }
        
        const food = await foodModel.findById(id);
        
        if (!food) {
            return res.json({ success: false, message: "Không tìm thấy món ăn!" });
        }
        
        res.json({ success: true, food });
        
    } catch (error) {
        console.error("Get food by ID error:", error);
        res.json({ 
            success: false, 
            message: "Lỗi khi lấy thông tin món ăn!" 
        });
    }
};

// ========== THÊM HÀM: LẤY MÓN ĂN THEO DANH MỤC ==========
export const getFoodByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!category) {
            return res.json({ success: false, message: "Thiếu danh mục!" });
        }
        
        const foods = await foodModel.find({ category });
        
        res.json({ 
            success: true, 
            count: foods.length,
            foods 
        });
        
    } catch (error) {
        console.error("Get food by category error:", error);
        res.json({ 
            success: false, 
            message: "Lỗi khi lấy món ăn theo danh mục!" 
        });
    }
};