import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { ok, error } from "../utils/responseUtils";

class ApiTestController {
  async compileLatexToPdf(req: Request, res: Response) {
    try {
      const latexCode = String.raw`\documentclass{article}
\usepackage[utf8]{inputenc}
\begin{document}
Hello from latexonline.cc!\\
This is a PDF generated at ${new Date().toISOString()}.
\end{document}`;

      const endpoint = `https://latexonline.cc/compile?text=${encodeURIComponent(latexCode)}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        return error(res, `latexonline.cc returned status ${response.status}`);
      }

      const binary = await response.arrayBuffer();
      const pdfBuffer = Buffer.from(binary);

      const outputDir = path.resolve(process.cwd(), "tmp");
      await fs.mkdir(outputDir, { recursive: true });

      const fileName = `latex-test-${Date.now()}.pdf`;
      const outputPath = path.join(outputDir, fileName);

      await fs.writeFile(outputPath, pdfBuffer);

      return ok(res, {
        message: "Compiled LaTeX and wrote PDF file successfully",
        latexCode,
        endpoint,
        filePath: outputPath,
        bytes: pdfBuffer.length,
      });
    } catch (err) {
      console.error(err);
      return error(res, "Failed to compile LaTeX and write PDF file");
    }
  }
}

export const apiTestController = new ApiTestController();
