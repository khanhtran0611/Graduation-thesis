import express, { Request, Response } from "express";
import { sharedFileController } from "../modules/common/image-managment/controller/image.controller";
import { upload } from "../middlewares/upload.middleware";
import { authorization } from "../auth/auth.middleware";
export const router = express.Router();

/**
 * @route   POST /api/image/upload
 * @desc    Upload 1 ảnh lên hệ thống
 * @access  Private/Public (Tùy auth middleware của ông)
 */
router.post("/upload", upload.single("image"), (req, res) =>
  sharedFileController.saveImage(req, res)
);

/**
 * @route   GET /api/image/view/:fileName
 * @desc    Xem ảnh (Proxy qua Backend để lấy dữ liệu từ MinIO)
 */
router.get("/view/:fileName", (req, res) => sharedFileController.proxyImage(req, res));

/**
 * @route   POST /api/image/delete
 * @desc    Xóa danh sách nhiều ảnh cùng lúc
 */
router.post("/delete", (req, res) => sharedFileController.deleteImages(req, res));

export default router;
