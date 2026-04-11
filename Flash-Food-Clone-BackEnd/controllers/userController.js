import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

// 1. Tạo token
const createToken = (id, isAdmin = false) => {
    return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 2. Đăng nhập - Đã thêm trả về ảnh để Navbar hiện ngay khi login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Người dùng không tồn tại" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Mật khẩu không đúng" });
        }
        
        const token = createToken(user._id, user.isAdmin);
        res.json({
            success: true,
            message: "Đăng nhập thành công",
            token,
            isAdmin: user.isAdmin,
            name: user.name,
            image: user.image || "" // Trả về ảnh để lưu vào context
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.json({ success: false, message: "Lỗi hệ thống khi đăng nhập" });
    }
};

// 3. Đăng ký
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Email đã được sử dụng" });
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Email không hợp lệ" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Mật khẩu tối thiểu 8 ký tự" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            phone: phone || "",
            secondaryPhone: "", 
            role: "customer",    
            isAdmin: false,
            isActive: true,
            address: "Chưa cập nhật",
            gender: "Nam",
            dob: ""              
        });

        const savedUser = await newUser.save();
        const token = createToken(savedUser._id, savedUser.isAdmin);

        res.json({ success: true, message: "Đăng ký thành công", token, name: savedUser.name });
    } catch (error) {
        console.error("Register Error:", error);
        res.json({ success: false, message: "Lỗi hệ thống khi đăng ký" });
    }
};

// 4. CẬP NHẬT PROFILE - Tối ưu trả về image đồng nhất cho Frontend
const updateUser = async (req, res) => {
    try {
        const userId = req.userId; 

        if (!userId) {
            return res.json({ success: false, message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!" });
        }

        const { name, email, phone, backupPhone, gender, birthday, address, password } = req.body;
        
        const updateData = { 
            name, 
            email, 
            phone, 
            secondaryPhone: backupPhone || "", 
            gender: gender || "Nam", 
            dob: birthday || "",              
            address: address || "" 
        };

        // Nếu có thay đổi mật khẩu
        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // Xử lý ảnh đại diện nếu có upload file mới
        if (req.file) {
            updateData.image = req.file.filename;
        }

        // Cập nhật và lấy dữ liệu mới nhất
        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        
        if (!updatedUser) {
            return res.json({ success: false, message: "Không tìm thấy người dùng" });
        }

        res.json({ 
            success: true, 
            message: "Cập nhật thông tin thành công!", 
            user: updatedUser, // Gửi full user để Frontend update linh hoạt
            image: updatedUser.image // Gửi key "image" riêng để StoreContext dễ bắt
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.json({ success: false, message: "Lỗi server khi cập nhật profile" });
    }
};

// 5. Lấy thông tin cá nhân
const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password').lean();
        if (!user) {
            return res.json({ success: false, message: "Không tìm thấy người dùng" });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: "Lỗi khi tải thông tin cá nhân" });
    }
};

// 6. Đổi mật khẩu
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await userModel.findById(req.userId);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Mật khẩu cũ không chính xác" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error) {
        res.json({ success: false, message: "Lỗi hệ thống khi đổi mật khẩu" });
    }
};

// 7. Các hàm dành cho Admin
const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password').sort({createdAt: -1});
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: "Lỗi lấy danh sách" });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Đã xóa người dùng thành công" });
    } catch (error) {
        res.json({ success: false, message: "Lỗi khi xóa" });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.id);
        if (!user) return res.json({ success: false, message: "User không tồn tại" });
        
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, message: `Đã ${user.isActive ? 'mở khóa' : 'khóa'} tài khoản` });
    } catch (error) {
        res.json({ success: false, message: "Lỗi khi thay đổi trạng thái" });
    }
};

export { 
    loginUser, 
    registerUser, 
    listUsers, 
    deleteUser, 
    updateUser, 
    getProfile,
    changePassword,
    toggleUserStatus
};