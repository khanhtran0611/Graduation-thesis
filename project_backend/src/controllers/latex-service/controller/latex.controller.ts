import { Request, Response } from "express";
import { latexService } from "../service/latex.service";
import "multer";

class LatexController {
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
}

export const latexController = new LatexController();
