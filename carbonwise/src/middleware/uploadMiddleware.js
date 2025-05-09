// backend/middleware/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// 1) diskStorage that preserves the extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.IMAGE_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

// 2) fileFilter to only allow images
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  cb(allowed.test(ext) ? null : new Error('Only .jpg/.jpeg/.png allowed'), allowed.test(ext));
};

// 3) put it all together
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
});

export default upload;
