import jwt from "jsonwebtoken";
import 'dotenv/config';
import userModel from "../models/userModel.js";

// Middleware xác thực người dùng thông thường
export const authMiddleware = async (req, res, next) => {
    // Lấy token từ headers (hỗ trợ cả viết hoa và viết thường)
    const token = req.headers.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.json({
            success: false,
            message: "Bạn chưa đăng nhập. Vui lòng đăng nhập lại!"
        });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // 1. Lưu ID vào req để các hàm sau sử dụng
        req.userId = token_decode.id; 
        
        // 2. (Tùy chọn) Kiểm tra xem user có còn tồn tại hoặc bị khóa không
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.json({ success: false, message: "Người dùng không tồn tại!" });
        }
        
        if (user.isActive === false) {
            return res.json({ success: false, message: "Tài khoản của bạn đã bị khóa!" });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.json({
            success: false,
            message: "Phiên đăng nhập hết hạn hoặc Token không lệ!"
        });
    }
};

// Middleware xác thực quyền Admin
export const adminMiddleware = async (req, res, next) => {
    const token = req.headers.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.json({
            success: false,
            message: "Yêu cầu quyền Admin. Vui lòng đăng nhập!"
        });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kiểm tra quyền admin dựa trên token
        if (!token_decode.isAdmin) {
            return res.json({
                success: false,
                message: "Lỗi: Admin access required. Bạn không có quyền truy cập!"
            });
        }

        req.userId = token_decode.id;
        next();
    } catch (error) {
        console.error("Admin Middleware Error:", error.message);
        return res.json({
            success: false,
            message: "Token Admin không hợp lệ!"
        });
    }
};