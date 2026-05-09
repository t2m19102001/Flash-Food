import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập họ tên'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    subject: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung tin nhắn'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied'],
        default: 'pending'
    },
    repliedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const contactModel = mongoose.models.contact || mongoose.model('contact', contactSchema);
export default contactModel;