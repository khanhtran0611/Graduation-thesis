import { Router } from "express";
import ExamsController from "../controllers/exams.controller";

const router = Router();

router.post("/", ExamsController.saveRootExam);
router.post("/generate-codes", (req, res) => ExamsController.generateExamCodes(req, res));
router.post("/by-code", (req, res) => ExamsController.getExamIdByRootAndCode(req, res));
router.post("/codes", (req, res) => ExamsController.getExamCodesByRootId(req, res));
router.delete("/:id", (req, res) => ExamsController.deleteExamById(req, res));
router.get("/:id/questions", (req, res) => ExamsController.getExamQuestions(req, res));

export default router;
