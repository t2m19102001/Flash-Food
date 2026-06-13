import bannerModel from "../models/bannerModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lấy danh sách banner
export const getBanners = async (req, res) => {
    try {
        const banners = await bannerModel.find({}).sort({ order: 1 });
        res.json({ success: true, banners });
    } catch (error) {
        console.error("Get banners error:", error);
        res.status(500).json({ success: false, message: "Lỗi tải banner" });
    }
};

// Thêm banner mới
export const addBanner = async (req, res) => {
    try {
        const { title, subtitle, link, order, isActive } = req.body;
        
        if (!title || !req.file) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin banner" });
        }

        const newBanner = new bannerModel({
            title,
            subtitle: subtitle || "",
            link: link || "",
            image: req.file.filename,
            order: order || 0,
            isActive: isActive === "true"
        });

        await newBanner.save();
        res.json({ success: true, message: "Thêm banner thành công", banner: newBanner });
    } catch (error) {
        console.error("Add banner error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi thêm banner" });
    }
};

// Cập nhật banner
export const updateBanner = async (req, res) => {
    try {
        const { id, title, subtitle, link, order, isActive } = req.body;
        
        const banner = await bannerModel.findById(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Không tìm thấy banner" });
        }

        banner.title = title || banner.title;
        banner.subtitle = subtitle !== undefined ? subtitle : banner.subtitle;
        banner.link = link !== undefined ? link : banner.link;
        banner.order = order !== undefined ? order : banner.order;
        banner.isActive = isActive !== undefined ? isActive === "true" : banner.isActive;

        if (req.file) {
            // Xóa ảnh cũ
            const oldImagePath = path.join(__dirname, "../uploads", banner.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            banner.image = req.file.filename;
        }

        await banner.save();
        res.json({ success: true, message: "Cập nhật banner thành công", banner });
    } catch (error) {
        console.error("Update banner error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật banner" });
    }
};

// Xóa banner
export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.body;
        
        const banner = await bannerModel.findById(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Không tìm thấy banner" });
        }

        // Xóa file ảnh
        const imagePath = path.join(__dirname, "../uploads", banner.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await bannerModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Xóa banner thành công" });
    } catch (error) {
        console.error("Delete banner error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa banner" });
    }
};