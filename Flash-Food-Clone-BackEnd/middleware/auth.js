import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import userModel from "../models/userModel.js";

dotenv.config();

// ========== TOKEN & COOKIE HELPERS ==========

// Tạo token và set cookie httpOnly
export const generateTokenAndSetCookie = (res, userId, isAdmin = false) => {
    const token = jwt.sign({ id: userId, isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
    
    // Set httpOnly cookie - BẢO MẬT HƠN LOCALSTORAGE
    res.cookie('token', token, {
        httpOnly: true,      // Không thể truy cập bằng JavaScript (chống XSS)
        secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS trong production
        sameSite: 'lax',     // 'strict' có thể gây lỗi khi redirect
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });
    
    return token;
};

// Xóa cookie (đăng xuất)
export const clearTokenCookie = (res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
};

// Lấy token từ cookie
export const getTokenFromCookie = (req) => {
    return req.cookies?.token || null;
};

// ========== MIDDLEWARE XÁC THỰC NGƯỜI DÙNG ==========
export const authMiddleware = async (req, res, next) => {
    // Lấy token từ cookie (ưu tiên) hoặc từ header (fallback)
    const token = req.cookies?.token || req.headers.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập. Vui lòng đăng nhập lại!"
        });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        req.userId = token_decode.id;
        req.user = {
            id: token_decode.id,
            isAdmin: token_decode.isAdmin || false
        };
        
        const user = await userModel.findById(req.userId).select('isActive');
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Người dùng không tồn tại. Vui lòng đăng nhập lại!" 
            });
        }
        
        if (user.isActive === false) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ!" 
            });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        
        if (error.name === 'JsonWebTokenError') {
            clearTokenCookie(res);
            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ. Vui lòng đăng nhập lại!"
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            clearTokenCookie(res);
            return res.status(401).json({
                success: false,
                message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Lỗi xác thực. Vui lòng thử lại sau!"
        });
    }
};

// ========== MIDDLEWARE XÁC THỰC ADMIN ==========
export const adminMiddleware = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Yêu cầu quyền Admin. Vui lòng đăng nhập!"
        });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!token_decode.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Lỗi: Admin access required. Bạn không có quyền truy cập!"
            });
        }

        req.userId = token_decode.id;
        req.user = {
            id: token_decode.id,
            isAdmin: token_decode.isAdmin
        };
        
        const user = await userModel.findById(req.userId).select('isActive isAdmin');
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Người dùng không tồn tại!" 
            });
        }
        
        if (user.isActive === false) {
            return res.status(403).json({ 
                success: false, 
                message: "Tài khoản Admin đã bị khóa!" 
            });
        }
        
        if (user.isAdmin !== true) {
            return res.status(403).json({
                success: false,
                message: "Tài khoản không có quyền Admin!"
            });
        }
        
        next();
    } catch (error) {
        console.error("Admin Middleware Error:", error.message);
        
        if (error.name === 'JsonWebTokenError') {
            clearTokenCookie(res);
            return res.status(401).json({
                success: false,
                message: "Token Admin không hợp lệ!"
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            clearTokenCookie(res);
            return res.status(401).json({
                success: false,
                message: "Phiên đăng nhập Admin đã hết hạn!"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Lỗi xác thực Admin. Vui lòng thử lại!"
        });
    }
};

// ========== MIDDLEWARE KIỂM TRA ĐĂNG NHẬP (KHÔNG BẮT BUỘC) ==========
export const optionalAuthMiddleware = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        req.user = null;
        req.userId = null;
        return next();
    }
    
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = token_decode.id;
        req.user = {
            id: token_decode.id,
            isAdmin: token_decode.isAdmin || false
        };
        next();
    } catch (error) {
        console.warn("Optional auth warning:", error.message);
        req.user = null;
        req.userId = null;
        next();
    }
};

// ========== LẤY THÔNG TIN USER TỪ TOKEN ==========
export const getUserFromToken = async (req) => {
    const token = req.cookies?.token || req.headers.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');
        return user;
    } catch (error) {
        return null;
    }
};

// ========== HELPER: KIỂM TRA TOKEN ==========
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// ========== HELPER: LẤY USER ID TỪ TOKEN ==========
export const getUserIdFromToken = (token) => {
    const decoded = verifyToken(token);
    return decoded?.id || null;
};

// ========== MIDDLEWARE: LÀM MỚI TOKEN (nếu cần) ==========
export const refreshTokenIfNeeded = async (req, res, next) => {
    const token = req.cookies?.token;
    
    if (!token) {
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        
        // Nếu token sắp hết hạn (dưới 2 ngày), tạo token mới
        if (expiresIn < 2 * 24 * 60 * 60) {
            const newToken = jwt.sign(
                { id: decoded.id, isAdmin: decoded.isAdmin || false }, 
                process.env.JWT_SECRET, 
                { expiresIn: '7d' }
            );
            
            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            console.log(`🔄 Refreshed token for user ${decoded.id}`);
        }
        
        next();
    } catch (error) {
        next();
    }
};