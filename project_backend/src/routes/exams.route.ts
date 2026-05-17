import { Router } from "express";
import ExamsController from "../controllers/exams.controller";
import compileLatexController from "../modules/exam-modules/controller/compileLatex.controller";
import { authorization } from "../auth/auth.middleware";

const router = Router();

router.post("/", authorization.authenticateToken, (req, res) =>
  ExamsController.saveRootExam(req, res)
);
router.post("/generate-codes", authorization.authenticateToken, (req, res) =>
  ExamsController.generateExamCodes(req, res)
);
router.post("/by-code", authorization.authenticateToken, (req, res) =>
  ExamsController.getExamIdByRootAndCode(req, res)
);
router.post("/codes", authorization.authenticateToken, (req, res) =>
  ExamsController.getExamCodesByRootId(req, res)
);
router.get("/root-exams/:course_id", authorization.authenticateToken, (req, res) =>
  ExamsController.getRootExamsByCourseId(req, res)
);
router.delete("/:id", authorization.authenticateToken, (req, res) =>
  ExamsController.deleteExamById(req, res)
);
router.get("/:id/questions", authorization.authenticateToken, (req, res) =>
  ExamsController.getExamQuestions(req, res)
);

router.post("/compile-pdf", authorization.authenticateToken, (req, res) =>
  compileLatexController.compileExamLatex(req, res)
);

router.get("/node-info/:node_id", authorization.authenticateToken, (req, res) =>
  ExamsController.getNodeInfo(req, res)
);
export default router;
