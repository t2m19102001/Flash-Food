import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Admin login - set cookie HttpOnly
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu" });
        }
        
        const admin = await userModel.findOne({ email, isAdmin: true });
        
        if (!admin) {
            return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu" });
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu" });
        }
        
        if (!admin.isActive) {
            return res.status(403).json({ success: false, message: "Tài khoản admin đã bị khóa" });
        }
        
        const token = jwt.sign(
            { id: admin._id, isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        console.log(`✅ Admin login successful: ${admin.email}`);
        
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            name: admin.name,
            email: admin.email,
            isAdmin: true
        });
        
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

// Admin logout
export const adminLogout = async (req, res) => {
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true, message: "Đã đăng xuất" });
};

// Check admin auth
export const checkAdminAuth = async (req, res) => {
    try {
        const adminId = req.userId;
        
        if (!adminId) {
            return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
        }
        
        const admin = await userModel.findById(adminId).select('-password');
        
        if (!admin || !admin.isAdmin) {
            return res.status(401).json({ success: false, message: "Không có quyền admin" });
        }
        
        if (!admin.isActive) {
            return res.status(403).json({ success: false, message: "Tài khoản admin đã bị khóa" });
        }
        
        res.json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                isAdmin: admin.isAdmin
            }
        });
    } catch (error) {
        console.error("Check admin auth error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Đổi mật khẩu admin
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const adminId = req.userId;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "Mật khẩu mới tối thiểu 8 ký tự" });
        }
        
        const admin = await userModel.findById(adminId);
        
        if (!admin) {
            return res.status(404).json({ success: false, message: "Không tìm thấy admin" });
        }
        
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác" });
        }
        
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();
        
        res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

// Lấy danh sách tất cả admin (super admin)
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await userModel.find({ isAdmin: true }).select('-password');
        res.json({ success: true, admins });
    } catch (error) {
        console.error("Get all admins error:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách admin" });
    }
};

// Lấy thống kê hệ thống
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments({ isAdmin: false });
        const totalAdmins = await userModel.countDocuments({ isAdmin: true });
        const activeUsers = await userModel.countDocuments({ isActive: true, isAdmin: false });
        const blockedUsers = await userModel.countDocuments({ isActive: false, isAdmin: false });
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalAdmins,
                activeUsers,
                blockedUsers
            }
        });
    } catch (error) {
        console.error("Get admin stats error:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy thống kê" });
    }
};