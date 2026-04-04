import jwt from "jsonwebtoken";
import 'dotenv/config';

// Middleware to verify JWT token
export const authMiddleware = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        return res.json({
            success: false,
            message: "Not authorized. Please login again."
        });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = token_decode.id; // Lưu vào req thay vì req.body
        req.user = token_decode; // Lưu cả token_decode để dùng sau này
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.json({
            success: false,
            message: "Invalid token. Please login again."
        });
    }
};

// Middleware to verify admin role
export const adminMiddleware = async (req, res, next) => {
    const { token } = req.headers;


    if (!token) {
        return res.json({
            success: false,
            message: "Not authorized. Admin access required."
        });
    }

    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!token_decode.isAdmin) {
            return res.json({
                success: false,
                message: "Admin access required."
            });
        }

        req.userId = token_decode.id; // Lưu vào req thay vì req.body
        req.user = token_decode; // Lưu cả token_decode để dùng sau này
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.json({
            success: false,
            message: "Invalid token."
        });
    }
};
