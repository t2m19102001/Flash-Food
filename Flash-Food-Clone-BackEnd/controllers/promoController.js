import promoModel from "../models/promoModel.js";

// Validate promo code (public - for customers)
const validatePromo = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.json({ success: false, message: "Vui lòng nhập mã khuyến mãi" });
        }

        const promo = await promoModel.findOne({ code: code.toUpperCase(), isActive: true });

        if (!promo) {
            return res.json({ success: false, message: "Mã khuyến mãi không hợp lệ" });
        }

        if (promo.expiresAt < new Date()) {
            return res.json({ success: false, message: "Mã khuyến mãi đã hết hạn" });
        }

        if (promo.usedCount >= promo.maxUses) {
            return res.json({ success: false, message: "Mã khuyến mãi đã hết lượt sử dụng" });
        }

        res.json({
            success: true,
            message: `Giảm ${promo.discountPercent}%`,
            discountPercent: promo.discountPercent,
            code: promo.code
        });
    } catch (error) {
        console.error("Error validating promo:", error);
        res.json({ success: false, message: "Lỗi khi kiểm tra mã khuyến mãi" });
    }
};

// Use promo code (increment usedCount)
const usePromo = async (code) => {
    try {
        await promoModel.findOneAndUpdate(
            { code: code.toUpperCase() },
            { $inc: { usedCount: 1 } }
        );
    } catch (error) {
        console.error("Error using promo:", error);
    }
};

// Admin: create promo
const addPromo = async (req, res) => {
    try {
        const { code, discountPercent, maxUses, expiresAt } = req.body;
        const promo = new promoModel({ code, discountPercent, maxUses, expiresAt });
        await promo.save();
        res.json({ success: true, message: "Tạo mã khuyến mãi thành công", promo });
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ success: false, message: "Mã khuyến mãi đã tồn tại" });
        }
        console.error("Error adding promo:", error);
        res.json({ success: false, message: "Lỗi khi tạo mã khuyến mãi" });
    }
};

// Admin: list all promos
const listPromos = async (req, res) => {
    try {
        const promos = await promoModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, promos });
    } catch (error) {
        console.error("Error listing promos:", error);
        res.json({ success: false, message: "Lỗi khi lấy danh sách mã khuyến mãi" });
    }
};

// Admin: remove promo
const removePromo = async (req, res) => {
    try {
        await promoModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Đã xóa mã khuyến mãi" });
    } catch (error) {
        console.error("Error removing promo:", error);
        res.json({ success: false, message: "Lỗi khi xóa mã khuyến mãi" });
    }
};

export { validatePromo, usePromo, addPromo, listPromos, removePromo };
