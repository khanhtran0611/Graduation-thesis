import express, { Request, Response } from "express";
import { questionController } from "../controllers/question.controller";
import { upload, uploadTex } from "../middlewares/upload.middleware";
import { authorization } from "../auth/auth.middleware";

export const router = express.Router();

router.get(
  "/questions-card/:node_id",
  authorization.authenticateToken,
  questionController.getQuestionsCards
);

router.get("/api/image/:fileName", authorization.authenticateToken, questionController.proxyImage);

router.post(
  "/compile-latex",
  authorization.authenticateToken,
  uploadTex.single("file"),
  questionController.compileLatexPdf
);

router.get("/:id", authorization.authenticateToken, questionController.getQuestionById);

router.post("/", authorization.authenticateToken, questionController.createQuestion);

router.post(
  "/upload-image",
  authorization.authenticateToken,
  upload.single("image"),
  questionController.saveImage
);

router.post(
  "/upload-image-server",
  authorization.authenticateToken,
  upload.single("image"),
  questionController.uploadImageToCompileServer
);

router.post("/delete-images", authorization.authenticateToken, questionController.deleteImage);

router.put("/:id", authorization.authenticateToken, questionController.updateQuestion);

router.delete("/:id", authorization.authenticateToken, (req: Request, res: Response) => {
  questionController.deleteOneQuestion(req, res);
});

router.post("/delete-many", authorization.authenticateToken, (req: Request, res: Response) => {
  questionController.deleteManyQuestion(req, res);
});
