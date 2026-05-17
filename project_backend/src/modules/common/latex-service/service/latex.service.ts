import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

class LatexService {
  private minioEndpoint = process.env.MINIO_ENDPOINT || "localhost";
  private minioPort = process.env.MINIO_PORT || "9000";
  private minioBucket = process.env.MINIO_BUCKET || "";

  private buildImageUrl(imagePath: string) {
    const cleanPath = imagePath.replace(/^\/+/, "");
    const withBucket = cleanPath.includes("/")
      ? cleanPath
      : `${this.minioBucket}/${cleanPath}`.replace(/^\/+/, "");

    return `http://${this.minioEndpoint}:${this.minioPort}/${withBucket}`;
  }

  private async fetchImageBuffer(imagePath: string) {
    const response = await fetch(this.buildImageUrl(imagePath));

    if (!response.ok) {
      throw new Error(`IMAGE_FETCH_FAILED:${response.status}:${imagePath}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async compileTexToPdf(images: string[], texFile: Express.Multer.File): Promise<Buffer> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "latex-compile-"));
    const texFileName = path.basename(texFile.originalname || "document.tex");
    const texPath = path.join(tempDir, texFileName);

    try {
      await Promise.all(
        images.map(async (imagePath) => {
          const imageBuffer = await this.fetchImageBuffer(imagePath);
          const imageFileName = path.basename(imagePath);
          const imageOutputPath = path.join(tempDir, imageFileName);
          await fs.writeFile(imageOutputPath, imageBuffer);
        })
      );

      await fs.writeFile(texPath, texFile.buffer);

      await execFileAsync("tectonic", [texPath, "--outdir", tempDir], {
        cwd: tempDir,
      });

      const pdfFileName = `${path.parse(texFileName).name}.pdf`;
      const pdfPath = path.join(tempDir, pdfFileName);

      return await fs.readFile(pdfPath);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  async compileTexCodeToPdf(images: string[], texCode: string): Promise<Buffer> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "latex-compile-"));
    const texPath = path.join(tempDir, "document.tex");

    try {
      await Promise.all(
        images.map(async (imagePath) => {
          const imageBuffer = await this.fetchImageBuffer(imagePath);
          const imageFileName = path.basename(imagePath);
          const imageOutputPath = path.join(tempDir, imageFileName);
          await fs.writeFile(imageOutputPath, imageBuffer);
        })
      );

      // Write to temp directory for compilation
      await fs.writeFile(texPath, texCode);

      await execFileAsync("tectonic", [texPath, "--outdir", tempDir], {
        cwd: tempDir,
      });

      const pdfPath = path.join(tempDir, "document.pdf");

      return await fs.readFile(pdfPath);
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }
}

export const latexService = new LatexService();
