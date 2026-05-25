import { Request, Response } from "express";
import { DocumentOrchestrator } from "../../subsystem_latex-modules/core/document-orchestrator";
import { DocumentOrchestratorInterface } from "../../subsystem_latex-modules/core/orchestrator_interface";
import { ExamDetail2 } from "../../../types/exam";
import { latexCompileQueue } from "../../../config/redis";

class CompileLatexController {
  private documentOrchestrator: DocumentOrchestratorInterface;

  constructor() {
    this.documentOrchestrator = new DocumentOrchestrator();
  }

  public async compileExamLatex(req: Request, res: Response): Promise<Response> {
    try {
      const { exam, show, mode } = req.body as {
        exam: ExamDetail2;
        mode: string;
        show: number;
      };

      if (!exam || !exam.questions_list) {
        return res.status(400).json({ message: "exam with questions_list is required" });
      }

      if (!Array.isArray(exam.questions_list) || exam.questions_list.length === 0) {
        return res.status(400).json({ message: "questions_list must be a non-empty array" });
      }

      if (!mode) {
        return res.status(400).json({ message: "mode is required" });
      }

      if (typeof show !== "number" || (show !== 0 && show !== 1)) {
        return res.status(400).json({ message: "show must be 0 or 1" });
      }

      const { latexCode, images } = await this.documentOrchestrator.buildLatexCode(
        exam,
        mode,
        show
      );

      const job = await latexCompileQueue.add("compileExamLatex", {
        images: images,
        texCode: latexCode,
      });
      return res.status(202).json({
        message: "Exam compilation task is queued",
        jobId: job.id,
      });
    } catch (error) {
      console.error("Error queueing exam LaTeX:", error);
      return res.status(500).json({
        message: "Failed to queue exam compilation",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

const compileLatexController = new CompileLatexController();
export default compileLatexController;
