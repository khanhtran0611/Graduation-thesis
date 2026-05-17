import QuestionDB from "../models/question.model";
import { deleteFile } from "../utils/minioUtils";

type ProxiedFile = {
  buffer: Buffer;
  contentType: string;
  contentDisposition?: string | null;
};

type UploadForwardResult = {
  fileName: string;
};

class QuestionService {
  // Public endpoint is IP/host only (without protocol and port)
  private publicEndpoint = "minio";
  private minioPort = process.env.MINIO_PORT || "9000";
  private latexCompilePort = process.env.LATEX_COMPILE_PORT || "5022";

  private buildUrl(path: string, port: string) {
    const cleanPath = path.replace(/^\/+/, "");
    console.log(`Built URL: http://${this.publicEndpoint}:${port}/${cleanPath}`);
    return `http://${this.publicEndpoint}:${port}/${cleanPath}`;
  }

  async fetchImageByLink(imageLink: string): Promise<ProxiedFile> {
    const response = await fetch(this.buildUrl(imageLink, this.minioPort));

    if (!response.ok) {
      throw new Error(`IMAGE_FETCH_FAILED:${response.status}`);
    }

    const binary = await response.arrayBuffer();

    return {
      buffer: Buffer.from(binary),
      contentType: response.headers.get("content-type") || "application/octet-stream",
      contentDisposition: response.headers.get("content-disposition"),
    };
  }

  async compileLatexToPdf(images: string[], texFile: Express.Multer.File): Promise<ProxiedFile> {
    const formData = new FormData();

    for (const image of images) {
      formData.append("images", image);
    }

    formData.append(
      "file",
      new Blob([new Uint8Array(texFile.buffer)], {
        type: texFile.mimetype || "application/x-tex",
      }),
      texFile.originalname
    );

    const response = await fetch(this.buildUrl("compile", this.latexCompilePort), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`LATEX_COMPILE_FAILED:${response.status}`);
    }

    const binary = await response.arrayBuffer();

    return {
      buffer: Buffer.from(binary),
      contentType: response.headers.get("content-type") || "application/pdf",
      contentDisposition: response.headers.get("content-disposition"),
    };
  }

  async uploadImageToCompileServer(imageFile: Express.Multer.File): Promise<UploadForwardResult> {
    const formData = new FormData();

    formData.append(
      "file",
      new Blob([new Uint8Array(imageFile.buffer)], {
        type: imageFile.mimetype || "application/octet-stream",
      }),
      imageFile.originalname
    );

    const response = await fetch(this.buildUrl("images/upload", this.latexCompilePort), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`UPLOAD_IMAGE_SERVER_FAILED:${response.status}`);
    }

    const responseData = (await response.json()) as { fileName: string };

    return { fileName: responseData.fileName };
  }

  private collectQuestionImageFileNames(question: any): string[] {
    const names: string[] = [];

    // Parent images
    if (question?.image) {
      names.push(...(Array.isArray(question.image) ? question.image : [question.image]));
    }

    // Option images
    question?.options?.forEach((opt: any) => {
      if (opt?.image) {
        names.push(...(Array.isArray(opt.image) ? opt.image : [opt.image]));
      }
    });

    // Sub-question images and their options
    question?.questions_list?.forEach((sub: any) => {
      if (sub?.image) {
        names.push(...(Array.isArray(sub.image) ? sub.image : [sub.image]));
      }
      sub?.options?.forEach((opt: any) => {
        if (opt?.image) {
          names.push(...(Array.isArray(opt.image) ? opt.image : [opt.image]));
        }
      });
    });

    return [...new Set(names.filter(Boolean))];
  }

  async deleteQuestionAssetsById(questionId: string) {
    const question = await QuestionDB.findById(questionId, {
      image: 1,
      options: 1,
      questions_list: 1,
    }).lean();

    if (!question) {
      return {
        deleted: false,
        deletedImages: 0,
      };
    }

    const imageFileNames = this.collectQuestionImageFileNames(question);

    for (const fileName of imageFileNames) {
      await deleteFile(fileName);
    }

    await QuestionDB.deleteOne({ _id: questionId });

    return {
      deleted: true,
      deletedImages: imageFileNames.length,
    };
  }
}

export const questionService = new QuestionService();
