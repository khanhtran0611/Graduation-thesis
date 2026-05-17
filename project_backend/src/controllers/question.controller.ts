import { Request, Response } from "express";
import QuestionDB from "../models/question.model";
import type { Question as QuestionType, QuestionCard, OmittedQuestion2 } from "../types/questions";
import { toQuestion, toQuestionCard } from "../types/questions";
import { minioConfig } from "../config/minio";
import { deleteFile, uploadFile } from "../utils/minioUtils";
import { createLog } from "../utils/logUtils";
import { v4 as uuidv4 } from "uuid";
import { questionService } from "./question.service";
import { ok } from "../utils/responseUtils";
import { GeneralInfo, GroupInfo } from "../types/exam";
// Import multer types để TypeScript nhận diện req.file
import "multer";

class QuestionController {
  async getQuestionsCards(req: Request, res: Response) {
    try {
      const { node_id } = req.params;
      if (!node_id) {
        return res.status(400).json({ message: "node_id is required" });
      }
      const docs = await QuestionDB.find({
        node_id,
      }).lean();
      const questionCards: QuestionCard[] = docs.map((doc: any) =>
        toQuestionCard(doc as QuestionType)
      );
      return res.status(200).json({ data: questionCards });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getQuestionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "id is required" });
      }
      const doc = await QuestionDB.findById(id).lean();
      if (!doc) {
        return res.status(404).json({ message: "Question not found" });
      }
      const question: QuestionType = toQuestion(doc);
      return res.status(200).json({ data: question });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async saveImage(req: Request, res: Response) {
    try {
      // Lấy file từ request
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          message: "No image file provided",
        });
      }

      // Tạo tên file unique với uuid và timestamp
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `${uuidv4()}_${Date.now()}.${fileExtension}`;

      // Upload lên MinIO và lấy public URL
      const imageUrl = await uploadFile(file.buffer, fileName, file.mimetype);

      return res.status(200).json({
        message: "Image uploaded successfully",
        data: {
          url: imageUrl,
          fileName: fileName,
        },
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({
        message: "Failed to upload image",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async uploadImageToCompileServer(req: Request, res: Response) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const uploadResult = await questionService.uploadImageToCompileServer(file);
      return ok(res, uploadResult);
    } catch (error) {
      console.error("Error uploading image to compile server:", error);
      if (error instanceof Error && error.message.startsWith("UPLOAD_IMAGE_SERVER_FAILED:")) {
        return res.status(502).json({
          message: "Failed to upload image to compile server",
          error: error.message,
        });
      }

      return res.status(500).json({
        message: "Failed to upload image to compile server",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async proxyImage(req: Request, res: Response) {
    try {
      const imageLink = `${minioConfig.bucket}/${req.params.fileName}`;
      const proxiedImage = await questionService.fetchImageByLink(imageLink);

      res.setHeader("Content-Type", proxiedImage.contentType);
      if (proxiedImage.contentDisposition) {
        res.setHeader("Content-Disposition", proxiedImage.contentDisposition);
      }

      return res.status(200).send(proxiedImage.buffer);
    } catch (error) {
      console.error("Error proxying image:", error);
      if (error instanceof Error && error.message.startsWith("IMAGE_FETCH_FAILED:")) {
        return res.status(502).json({
          message: "Failed to fetch image from public endpoint",
          error: error.message,
        });
      }

      return res.status(500).json({
        message: "Failed to proxy image",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async compileLatexPdf(req: Request, res: Response) {
    try {
      const { images } = req.body as { images: string[] };
      const texFile = req.file;

      if (!texFile) {
        return res.status(400).json({ message: "file is required" });
      }

      const compiledPdf = await questionService.compileLatexToPdf(images, texFile);

      res.setHeader("Content-Type", compiledPdf.contentType);
      res.setHeader(
        "Content-Disposition",
        compiledPdf.contentDisposition || "attachment; filename=compiled.pdf"
      );

      return res.status(200).send(compiledPdf.buffer);
    } catch (error) {
      console.error("Error compiling LaTeX:", error);
      if (error instanceof Error && error.message.startsWith("LATEX_COMPILE_FAILED:")) {
        return res.status(502).json({
          message: "Failed to compile latex from public endpoint",
          error: error.message,
        });
      }

      return res.status(500).json({
        message: "Failed to compile latex",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async createQuestion(req: Request, res: Response) {
    try {
      const tokenUser = (req as any).user;
      const questionData = req.body;
      console.log("Received question data:", questionData);

      // Validate required fields
      if (!questionData.node_id) {
        return res.status(400).json({ message: "node_id is required" });
      }
      if (!questionData.type) {
        return res.status(400).json({ message: "type is required" });
      }
      if (!questionData.difficulty) {
        return res.status(400).json({ message: "difficulty is required" });
      }
      if (!questionData.content) {
        return res.status(400).json({ message: "content is required" });
      }
      if (!questionData.options || !Array.isArray(questionData.options)) {
        return res.status(400).json({ message: "options must be an array" });
      }

      // Tạo question mới
      const newQuestion = await QuestionDB.create(questionData);

      const newQuestionObj = toQuestion(newQuestion);

      await createLog(
        tokenUser?.id || "",
        tokenUser?.name || tokenUser?.username || "",
        tokenUser?.role || "",
        "CREATE_QUESTION"
      );

      return res.status(201).json({
        message: "Question created successfully",
        data: newQuestionObj,
      });
    } catch (error) {
      console.error("Error creating question:", error);
      if (error instanceof Error && error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          error: error.message,
        });
      }
      return res.status(500).json({
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateQuestion(req: Request, res: Response) {
    try {
      const tokenUser = (req as any).user;
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({ message: "Question ID is required" });
      }

      // Tìm và cập nhật question
      const updatedQuestion = await QuestionDB.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }

      await createLog(
        tokenUser?.id || "",
        tokenUser?.name || tokenUser?.username || "",
        tokenUser?.role || "",
        "UPDATE_QUESTION"
      );

      return res.status(200).json({
        message: "Question updated successfully",
        data: toQuestion(updatedQuestion),
      });
    } catch (error) {
      console.error("Error updating question:", error);
      if (error instanceof Error && error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          error: error.message,
        });
      }
      return res.status(500).json({
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteImage(req: Request, res: Response) {
    try {
      let { fileNames } = req.body;

      console.log("Received file names for deletion:", fileNames);

      if (!Array.isArray(fileNames) || fileNames.length === 0) {
        return res.status(400).json({
          message: "fileNames must be a non-empty array",
        });
      }

      const deletedFiles: string[] = [];
      const failedFiles: { fileName: string; error: string }[] = [];

      for (const fileName of fileNames) {
        try {
          console.log(`Attempting to delete file: ${fileName} from MinIO`);
          await deleteFile(fileName);
          console.log(`Successfully deleted file: ${fileName} from MinIO`);
          deletedFiles.push(fileName);
        } catch (error) {
          failedFiles.push({
            fileName,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return res.status(200).json({
        message: "Image deletion completed",
        data: {
          deleted: deletedFiles.length,
          failed: failedFiles.length,
          deletedFiles,
          failedFiles,
        },
      });
    } catch (error) {
      console.error("Error deleting images:", error);
      return res.status(500).json({
        message: "Failed to delete images",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteManyQuestion(req: Request, res: Response) {
    try {
      const tokenUser = (req as any).user;
      let { questionIds } = req.body;

      if (!Array.isArray(questionIds)) {
        return res.status(400).json({
          message: "questionIds must be an array",
        });
      }

      questionIds = questionIds.filter((id: any) => !!id);

      if (questionIds.length === 0) {
        return res.status(400).json({
          message: "questionIds must contain at least one id",
        });
      }

      let deleted = 0;
      let deletedImages = 0;

      for (const questionId of questionIds) {
        const itemResult = await questionService.deleteQuestionAssetsById(questionId);
        if (itemResult.deleted) {
          deleted += 1;
          deletedImages += itemResult.deletedImages;
        }
      }

      await createLog(
        tokenUser?.id || "",
        tokenUser?.name || tokenUser?.username || "",
        tokenUser?.role || "",
        "DELETE_MANY_QUESTION"
      );

      return res.status(200).json({
        message: "Questions deleted successfully",
        data: {
          requested: questionIds.length,
          deleted,
          deletedImages,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("INVALID_IMAGE_URL:")) {
        return res.status(400).json({
          message: "Invalid image URL found while deleting questions",
          data: { invalidImageUrl: error.message.replace("INVALID_IMAGE_URL:", "") },
        });
      }

      console.error("Error deleting questions:", error);
      return res.status(500).json({
        message: "Failed to delete questions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteOneQuestion(req: Request, res: Response) {
    try {
      const tokenUser = (req as any).user;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "id is required",
        });
      }

      const result = await questionService.deleteQuestionAssetsById(id);

      if (!result.deleted) {
        return res.status(404).json({ message: "Question not found" });
      }

      await createLog(
        tokenUser?.id || "",
        tokenUser?.name || tokenUser?.username || "",
        tokenUser?.role || "",
        "DELETE_ONE_QUESTION"
      );

      return res.status(200).json({
        message: "Question deleted successfully",
        data: {
          deleted: 1,
          deletedImages: result.deletedImages,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("INVALID_IMAGE_URL:")) {
        return res.status(400).json({
          message: "Invalid image URL found while deleting question",
          data: { invalidImageUrl: error.message.replace("INVALID_IMAGE_URL:", "") },
        });
      }

      console.error("Error deleting question:", error);
      return res.status(500).json({
        message: "Failed to delete question",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const questionController = new QuestionController();
