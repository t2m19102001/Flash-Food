import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    image: { type: String, default: "" },
    cartData: { type: Object, default: {} },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;