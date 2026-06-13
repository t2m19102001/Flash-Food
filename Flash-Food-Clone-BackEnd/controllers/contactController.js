import contactModel from '../models/contactModel.js';

// Gửi tin nhắn liên hệ
export const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate dữ liệu
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ thông tin!' 
            });
        }
        
        // Lưu vào database
        const newContact = new contactModel({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            status: 'pending'
        });
        
        await newContact.save();
        
        console.log(`📧 Đã nhận liên hệ mới từ: ${email}`);
        
        res.status(201).json({ 
            success: true, 
            message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.' 
        });
        
    } catch (error) {
        console.error('Submit contact error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi gửi tin nhắn. Vui lòng thử lại sau!' 
        });
    }
};

// Lấy danh sách liên hệ (Admin)
export const getContacts = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        const isAdmin = req.user?.isAdmin || false;
        if (!isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Không có quyền truy cập!' 
            });
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const [contacts, total] = await Promise.all([
            contactModel.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            contactModel.countDocuments()
        ]);
        
        res.json({
            success: true,
            contacts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalContacts: total,
                hasNextPage: page * limit < total
            }
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi lấy danh sách liên hệ!' 
        });
    }
};

// Cập nhật trạng thái liên hệ (Admin)
export const updateContactStatus = async (req, res) => {
    try {
        const isAdmin = req.user?.isAdmin || false;
        if (!isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Không có quyền truy cập!' 
            });
        }
        
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['pending', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Trạng thái không hợp lệ!' 
            });
        }
        
        const updatedContact = await contactModel.findByIdAndUpdate(
            id,
            { status, repliedAt: status === 'replied' ? new Date() : null },
            { new: true }
        );
        
        if (!updatedContact) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy liên hệ!' 
            });
        }
        
        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công!',
            contact: updatedContact
        });
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi cập nhật trạng thái!' 
        });
    }
};

// Xóa liên hệ (Admin)
export const deleteContact = async (req, res) => {
    try {
        const isAdmin = req.user?.isAdmin || false;
        if (!isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Không có quyền truy cập!' 
            });
        }
        
        const { id } = req.params;
        const deletedContact = await contactModel.findByIdAndDelete(id);
        
        if (!deletedContact) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy liên hệ!' 
            });
        }
        
        res.json({
            success: true,
            message: 'Xóa liên hệ thành công!'
        });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi xóa liên hệ!' 
        });
    }
};