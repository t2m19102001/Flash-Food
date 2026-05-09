import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Lấy đường dẫn thư mục hiện tại (cho ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadDir, 'images');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Lưu vào thư mục uploads/images
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        // Lấy extension của file
        const ext = path.extname(file.originalname);
        // Tạo tên file: timestamp + số ngẫu nhiên + extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + ext);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    // Kiểm tra MIME type
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Định dạng file không hợp lệ. Chỉ chấp nhận JPEG, JPG, PNG, GIF, WEBP.'), false);
    }
};

// Configure upload with validation
export const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Error handler for multer errors
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Lỗi từ multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.json({
                success: false,
                message: 'File quá lớn. Kích thước tối đa là 5MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.json({
                success: false,
                message: 'Quá nhiều file. Chỉ được phép upload 1 file.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.json({
                success: false,
                message: 'Trường file không hợp lệ.'
            });
        }
        return res.json({
            success: false,
            message: `Lỗi upload: ${err.message}`
        });
    } 
    
    if (err) {
        // Lỗi từ file filter hoặc lỗi khác
        return res.json({
            success: false,
            message: err.message || 'Có lỗi xảy ra khi upload file.'
        });
    }
    
    // Không có lỗi, tiếp tục
    next();
};

// Middleware để kiểm tra file có tồn tại không (tùy chọn)
export const validateImage = (req, res, next) => {
    if (!req.file && req.body.image === undefined) {
        // Không có file upload và cũng không có image cũ, vẫn cho phép tiếp tục
        return next();
    }
    next();
};