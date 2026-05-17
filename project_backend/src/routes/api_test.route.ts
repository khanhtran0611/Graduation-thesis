import express from "express";
import { apiTestController } from "../controllers/api_test.controller";

export const router = express.Router();

router.get("/latex-pdf", apiTestController.compileLatexToPdf);
