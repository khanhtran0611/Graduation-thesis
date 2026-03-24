import express, { Request, Response } from "express";
import { questionController } from "../controllers/question.controller";
import { upload } from "../middlewares/upload.middleware";

export const router = express.Router();

// Route GET
router.get("/questions-card/:node_id", questionController.getQuestionsCards);
router.get("/:id", questionController.getQuestionById);

// Route POST - Tạo question mới
router.post("/", questionController.createQuestion);

// Route POST - Upload ảnh lên MinIO
// Frontend gửi file với field name là "image"
router.post("/upload-image", upload.single("image"), questionController.saveImage);

// Route POST - Xóa ảnh trên MinIO
router.post("/delete-images", questionController.deleteImage);

// Route POST - Lấy danh sách câu hỏi theo mảng id (preview linkedQuestionPreview)
router.post("/linked", questionController.getLinkedQuestions);

// Route POST - Kiểm tra question có số phần tử questions_list lớn hơn maximum_sub
router.post("/maximum-sub/check", questionController.getQuestionsExceedMaximumSub);

// Route POST - Thêm parent_id vào linked[] của các question con trong question_list
router.post("/link/:parent_id", questionController.addQuestionLink);

// Route POST - Xóa parent_id khỏi linked[] của các question con trong question_list
router.post("/unlink/:parent_id", questionController.removeQuestionLink);

// Route PUT - Cập nhật question
router.put("/:id", questionController.updateQuestion);

// Route DELETE - Xóa 1 question theo id params
router.delete("/:id", (req: Request, res: Response) => {
  questionController.deleteOneQuestion(req, res);
});

// Route DELETE - Xóa nhiều question theo mảng questionIds trong body
router.post("/delete-many", (req: Request, res: Response) => {
  questionController.deleteManyQuestion(req, res);
});
