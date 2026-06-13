import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import { generateTokenAndSetCookie, clearTokenCookie } from "../middleware/auth.js";

// 1. Tạo token
const createToken = (id, isAdmin = false) => {
    return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 2. Đăng nhập
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Email không tồn tại" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Mật khẩu không đúng" });
        }
        
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ!" });
        }
        
        // Tạo token
        const token = createToken(user._id, user.isAdmin);
        
        // Set cookie
        generateTokenAndSetCookie(res, user._id, user.isAdmin);
        
        // Trả về token cho frontend
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            token: token,
            userId: user._id,
            isAdmin: user.isAdmin,
            name: user.name,
            image: user.image || ""
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng nhập" });
    }
};

// 3. Đăng ký
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
        }
        
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "Email đã được sử dụng" });
        }
        
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Email không hợp lệ" });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Mật khẩu tối thiểu 8 ký tự" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone || "",
            secondaryPhone: "", 
            role: "customer",    
            isAdmin: false,
            isActive: true,
            address: "",
            gender: "Nam",
            dob: ""              
        });

        const savedUser = await newUser.save();
        
        // Tạo token
        const token = createToken(savedUser._id, savedUser.isAdmin);
        
        // Set cookie
        generateTokenAndSetCookie(res, savedUser._id, savedUser.isAdmin);

        res.status(201).json({ 
            success: true, 
            message: "Đăng ký thành công",
            token: token,
            userId: savedUser._id,
            name: savedUser.name,
            isAdmin: savedUser.isAdmin
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng ký" });
    }
};

// 4. Đăng xuất
const logoutUser = async (req, res) => {
    clearTokenCookie(res);
    res.json({ success: true, message: "Đã đăng xuất" });
};

// 5. Kiểm tra trạng thái đăng nhập
const checkAuthStatus = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
        }
        
        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            clearTokenCookie(res);
            return res.status(401).json({ success: false, message: "User không tồn tại" });
        }
        
        // Tạo token mới
        const token = createToken(user._id, user.isAdmin);
        
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                isAdmin: user.isAdmin
            },
            token: token
        });
    } catch (error) {
        console.error("Check auth error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Cập nhật profile
const updateUser = async (req, res) => {
    console.log("\n======= 📌 UPDATE API CALLED =======");
    
    try {
        const userId = req.user?.id || req.userId || req.body.userId;
        console.log("1. userId:", userId);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!" });
        }

        const { 
            name, 
            email, 
            phone, 
            secondaryPhone, 
            gender, 
            dob, 
            address, 
            password 
        } = req.body;
        
        console.log("2. Dữ liệu nhận được (req.body):", { name, email, phone, secondaryPhone, gender, dob, address });
        console.log("3. File upload:", req.file ? req.file.filename : "Không có ảnh mới");

        const updateData = {};
        
        if (name !== undefined) updateData.name = name.trim();
        if (email !== undefined) updateData.email = email.toLowerCase().trim();
        if (phone !== undefined) updateData.phone = phone;
        if (secondaryPhone !== undefined) updateData.secondaryPhone = secondaryPhone;
        if (gender !== undefined) updateData.gender = gender;
        if (dob !== undefined) updateData.dob = dob;
        if (address !== undefined) updateData.address = address;
        
        updateData.updatedAt = new Date();

        if (password && password.trim() !== "") {
            console.log("4. Có thay đổi mật khẩu");
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        if (req.file) {
            console.log("5. Có upload ảnh mới:", req.file.filename);
            updateData.image = req.file.filename;
        }

        console.log("6. Dữ liệu sẽ cập nhật vào DB:", updateData);

        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }

        console.log("7. ✅ UPDATE THÀNH CÔNG!");
        console.log("===================================\n");

        res.json({ 
            success: true, 
            message: "Cập nhật thông tin thành công!", 
            user: updatedUser,
            image: updatedUser.image
        });
        
    } catch (error) {
        console.error("❌ LỖI TRONG UPDATE USER:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi cập nhật profile: " + error.message 
        });
    }
};

// 7. Lấy thông tin cá nhân
const getProfile = async (req, res) => {
    console.log("\n======= 📌 GET PROFILE CALLED =======");
    try {
        const userId = req.user?.id || req.userId || req.query.userId;
        console.log("1. userId:", userId);
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Không tìm thấy userId" });
        }
        
        const user = await userModel.findById(userId).select('-password').lean();
        
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        
        console.log("2. Dữ liệu user trả về");
        console.log("===================================\n");
        
        res.json({ success: true, user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi tải thông tin cá nhân: " + error.message });
    }
};

// 8. Đổi mật khẩu
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "Mật khẩu mới tối thiểu 8 ký tự" });
        }
        
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Mật khẩu cũ không chính xác" });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        
        res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi đổi mật khẩu" });
    }
};

// 9. Admin: Danh sách người dùng
const listUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const [users, total] = await Promise.all([
            userModel.find({}).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            userModel.countDocuments()
        ]);
        
        res.json({ 
            success: true, 
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total
            }
        });
    } catch (error) {
        console.error("List users error:", error);
        res.status(500).json({ success: false, message: "Lỗi lấy danh sách" });
    }
};

// 10. Admin: Xóa người dùng
const deleteUser = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: "Thiếu ID người dùng" });
        }
        
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
        }
        
        const adminCount = await userModel.countDocuments({ isAdmin: true });
        if (user.isAdmin && adminCount === 1) {
            return res.status(400).json({ success: false, message: "Không thể xóa tài khoản Admin duy nhất" });
        }
        
        await userModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Đã xóa người dùng thành công" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi xóa" });
    }
};

// 11. Admin: Khóa/Mở khóa tài khoản
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: "Thiếu ID người dùng" });
        }
        
        const user = await userModel.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User không tồn tại" });
        
        if (user.isAdmin) {
            const adminCount = await userModel.countDocuments({ isAdmin: true });
            if (adminCount === 1) {
                return res.status(400).json({ success: false, message: "Không thể khóa tài khoản Admin duy nhất" });
            }
        }
        
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, message: `Đã ${user.isActive ? 'mở khóa' : 'khóa'} tài khoản` });
    } catch (error) {
        console.error("Toggle user status error:", error);
        res.status(500).json({ success: false, message: "Lỗi khi thay đổi trạng thái" });
    }
};

export { 
    loginUser, 
    registerUser,
    logoutUser,
    checkAuthStatus,
    listUsers, 
    deleteUser, 
    updateUser, 
    getProfile,
    changePassword,
    toggleUserStatus
};