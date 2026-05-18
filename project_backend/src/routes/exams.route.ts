import { Router } from "express";
import ExamsController from "../controllers/exams.controller";
import compileLatexController from "../modules/exam-modules/controller/compileLatex.controller";
import examMetadataController from "../modules/exam-modules/controller/exam_metadata.controller";
import generalManageController from "../modules/exam-modules/controller/general_manage.controller";
import { authorization } from "../auth/auth.middleware";

const router = Router();

router.post("/", authorization.authenticateToken, (req, res) =>
  examMetadataController.saveRootExam(req, res)
);
router.post("/generate-codes", authorization.authenticateToken, (req, res) =>
  generalManageController.generateExamCodes(req, res)
);
router.post("/by-code", authorization.authenticateToken, (req, res) =>
  generalManageController.getExamIdByRootAndCode(req, res)
);
router.post("/codes", authorization.authenticateToken, (req, res) =>
  generalManageController.getExamCodesByRootId(req, res)
);
router.get("/root-exams/:course_id", authorization.authenticateToken, (req, res) =>
  generalManageController.getRootExamsByCourseId(req, res)
);
router.delete("/:id", authorization.authenticateToken, (req, res) =>
  generalManageController.deleteExamById(req, res)
);
router.get("/:id/questions", authorization.authenticateToken, (req, res) =>
  generalManageController.getExamQuestions(req, res)
);

router.post("/compile-pdf", authorization.authenticateToken, (req, res) =>
  compileLatexController.compileExamLatex(req, res)
);

router.get("/node-info/:node_id", authorization.authenticateToken, (req, res) =>
  examMetadataController.getNodeInfo(req, res)
);
export default router;
