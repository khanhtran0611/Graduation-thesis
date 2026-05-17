import express, { Request, Response } from "express";
import { questionController } from "../modules/question-modules/controller/question.controller";
import { upload, uploadTex } from "../middlewares/upload.middleware";
import { authorization } from "../auth/auth.middleware";

export const router = express.Router();

// Lấy danh sách Cards
router.get(
  "/questions-card/:node_id",
  authorization.authenticateToken,
  questionController.getQuestionsCards
);

// Lấy chi tiết câu hỏi theo ID
router.get("/:id", authorization.authenticateToken, questionController.getQuestionById);

// Tạo câu hỏi mới
router.post("/", authorization.authenticateToken, questionController.createQuestion);

// Cập nhật câu hỏi
router.put("/:id", authorization.authenticateToken, questionController.updateQuestion);

// Xóa một câu hỏi
router.delete("/:id", authorization.authenticateToken, questionController.deleteOneQuestion);

// Xóa nhiều câu hỏi
router.post("/delete-many", authorization.authenticateToken, questionController.deleteManyQuestion);

// Lưu ý: Các hàm như compileLatexPdf, proxyImage, saveImage...
// nếu chưa chuyển sang kiến trúc Service mới thì ông vẫn gọi từ questionController cũ.

export default router;
