import multer from "multer";

// Sử dụng memory storage để lưu file vào buffer
// Sau đó sẽ upload buffer này lên MinIO
const storage = multer.memoryStorage();

// Cấu hình multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
  },
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận file ảnh
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});
