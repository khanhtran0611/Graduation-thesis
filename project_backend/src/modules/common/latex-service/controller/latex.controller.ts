import { Request, Response } from "express";
import { latexService } from "../service/latex.service";
import { DocumentOrchestrator } from "../../../subsystem_latex-modules/core/document-orchestrator";
import { DocumentOrchestratorInterface } from "../../../subsystem_latex-modules/core/orchestrator_interface";
import "multer";

class LatexController {
  private documentOrchestrator: DocumentOrchestratorInterface;

  constructor() {
    this.documentOrchestrator = new DocumentOrchestrator();
  }

  async compileTex(req: Request, res: Response) {
    try {
      console.log(req.body);
      const { images } = req.body as { images?: string | string[] };
      const imageList = images ? (Array.isArray(images) ? images : [images]) : [];

      console.log("Received images:", imageList);
      const texFile = req.file;

      if (!texFile) {
        return res.status(400).json({ message: "file is required" });
      }

      const pdfBuffer = await latexService.compileTexToPdf(imageList, texFile);
      //   const outputPath = path.join(process.cwd(), "compiled.pdf");
      //   await fs.writeFile(outputPath, pdfBuffer);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=compiled.pdf");

      return res.status(200).send(pdfBuffer);
      //   return res.status(200).send("Ok");
    } catch (error) {
      console.error("Error compiling LaTeX on local server:", error);
      if (error instanceof Error && error.message.startsWith("IMAGE_FETCH_FAILED:")) {
        return res.status(502).json({
          message: "Failed to fetch image from MinIO",
          error: error.message,
        });
      }

      return res.status(500).json({
        message: "Failed to compile latex",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async compileContent(req: Request, res: Response) {
    try {
      const { images, content } = req.body as {
        images?: string | string[];
        content?: string;
      };
      const imageList = images ? (Array.isArray(images) ? images : [images]) : [];

      if (!content) {
        return res.status(400).json({ message: "content is required" });
      }

      const latexCode = this.documentOrchestrator.buildQuestionContent(content);
      const pdfBuffer = await latexService.compileTexCodeToPdf(imageList, latexCode);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=exam.pdf");

      return res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Error compiling content LaTeX:", error);
      if (error instanceof Error && error.message.startsWith("LATEX_COMPILE_FAILED:")) {
        return res.status(502).json({
          message: "Failed to compile content LaTeX",
          error: error.message,
        });
      }

      return res.status(500).json({
        message: "Failed to compile content",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async compileOption(req: Request, res: Response) {
    try {
      const { images, option } = req.body as {
        images?: string | string[];
        option?: any;
      };
      const imageList = images ? (Array.isArray(images) ? images : [images]) : [];

      if (!option) {
        return res.status(400).json({ message: "option is required" });
      }

      const latexCode = this.documentOrchestrator.buildOptionLatex(option);
      const pdfBuffer = await latexService.compileTexCodeToPdf(imageList, latexCode);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=exam.pdf");

      return res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Error compiling option LaTeX:", error);
      if (error instanceof Error && error.message.startsWith("LATEX_COMPILE_FAILED:")) {
        return res.status(502).json({
          message: "Failed to compile option LaTeX",
          error: error.message,
        });
      }

      return res.status(500).json({
        message: "Failed to compile option",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const latexController = new LatexController();
