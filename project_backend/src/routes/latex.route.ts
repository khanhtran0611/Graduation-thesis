import express from "express";
import { authorization } from "../auth/auth.middleware";
import { uploadTex } from "../middlewares/upload.middleware";
import { latexController } from "../modules/common/latex-service/controller/latex.controller";

export const router = express.Router();

router.post("/compile", authorization.authenticateToken, uploadTex.single("file"), (req, res) =>
  latexController.compileTex(req, res)
);
router.post("/compile-content", authorization.authenticateToken, (req, res) =>
  latexController.compileContent(req, res)
);
router.post("/compile-option", authorization.authenticateToken, (req, res) =>
  latexController.compileOption(req, res)
);
