import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WEBP are allowed.'), false);
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
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
        return res.json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        return res.json({
            success: false,
            message: err.message
        });
    }
    next();
};
