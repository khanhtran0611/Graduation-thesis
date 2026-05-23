import express, { Request, Response } from "express";
import { questionController } from "../modules/question-modules/controller/question.controller";
import { upload, uploadTex, uploadTxt } from "../middlewares/upload.middleware";
import { authorization } from "../auth/auth.middleware";
import { parserController } from "../modules/parser-modules/controller/parser.controller";

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

// Upload aiken file
router.post("/upload/aiken/:node_id", authorization.authenticateToken, uploadTxt.single("file"), parserController.uploadAikenFile);

// Cập nhật câu hỏi
router.put("/:id", authorization.authenticateToken, questionController.updateQuestion);

// Xóa một câu hỏi
router.delete("/:id", authorization.authenticateToken, questionController.deleteOneQuestion);

// Xóa nhiều câu hỏi
router.post("/delete-many", authorization.authenticateToken, questionController.deleteManyQuestion);

// Archive một câu hỏi
router.put("/archive/:id", authorization.authenticateToken, questionController.archiveOneQuestion);

// Archive nhiều câu hỏi
router.post("/archive-many", authorization.authenticateToken, questionController.archiveManyQuestions);

// Restore một câu hỏi
router.put("/restore/:id", authorization.authenticateToken, questionController.restoreOneQuestion);

// Restore nhiều câu hỏi
router.post("/restore-many", authorization.authenticateToken, questionController.restoreManyQuestions);

// Lưu ý: Các hàm như compileLatexPdf, proxyImage, saveImage...
// nếu chưa chuyển sang kiến trúc Service mới thì ông vẫn gọi từ questionController cũ.

export default router;
