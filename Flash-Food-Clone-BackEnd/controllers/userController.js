import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

// user login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const token = createToken(user._id, user.isAdmin);
    res.json({
      success: true,
      message: "User logged in successfully",
      token: token,
      isAdmin: user.isAdmin,
      name: user.name
    });
  } catch (error) {
    res.json({ success: false, message: "Error logging in user" });
  }
};

const createToken = (id, isAdmin = false) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// user register
const registerUser = async (req, res) => {
  const { name, email, password, phone, role, isActive } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email address" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      phone: phone || "",
      isAdmin: role === "admin",
      isActive: isActive !== false // Default to true unless explicitly false
    });

    const savedUser = await newUser.save();

    // Sử dụng savedUser._id và isAdmin
    const token = createToken(savedUser._id, savedUser.isAdmin);

    res.json({
      success: true,
      message: "User registered successfully",
      token: token,
      isAdmin: savedUser.isAdmin,
      name: savedUser.name
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.json({ success: false, message: "Error registering user" });
  }
};

// list all users (admin only)
const listUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select('-password'); // Exclude password
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.json({ success: false, message: "Error fetching users" });
  }
};

// delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    await userModel.findByIdAndDelete(id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.json({ success: false, message: "Error deleting user" });
  }
};

// update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id, name, email, phone, isAdmin } = req.body;
    const updateData = { name, email };

    if (phone) {
      updateData.phone = phone;
    }

    if (typeof isAdmin !== 'undefined') {
      updateData.isAdmin = isAdmin;
    }

    // If new image uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    await userModel.findByIdAndUpdate(id, updateData);
    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.json({ success: false, message: "Error updating user" });
  }
};

// get user profile (authenticated user)
const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // from authMiddleware
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.json({ success: false, message: "Error fetching profile" });
  }
};

// change password (authenticated user)
const changePassword = async (req, res) => {
  try {
    const userId = req.userId; // from authMiddleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.json({ success: false, message: "Please provide all fields" });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "New password must be at least 8 characters" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.json({ success: false, message: "Error changing password" });
  }
};

// toggle user status (lock/unlock)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId, isActive } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Prevent admin from locking themselves
    if (req.userId && req.userId === userId) {
      return res.json({ success: false, message: "You cannot lock your own account" });
    }

    // Update user status
    user.isActive = isActive;
    await user.save();

    const action = isActive ? "mở khóa" : "khóa";
    res.json({
      success: true,
      message: `Đã ${action} tài khoản thành công`,
      isActive: user.isActive
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.json({ success: false, message: "Error toggling user status" });
  }
};

export { loginUser, registerUser, listUsers, deleteUser, updateUser, getProfile, changePassword, toggleUserStatus };
