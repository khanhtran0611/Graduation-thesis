import { Request, Response } from "express";
import jwtToken from "../auth/auth.services";
import QuestionDB from "../models/question.model";
import type {
  Question as QuestionType,
  QuestionCard,
  linkedQuestionPreview,
} from "../types/questions";
import { toQuestion, toQuestionCard, tolinkedQuestionPreview } from "../types/questions";
import { minioConfig } from "../config/minio";
import { deleteFile, uploadFile } from "../utils/minioUtils";
import { v4 as uuidv4 } from "uuid";
// Import multer types để TypeScript nhận diện req.file
import "multer";

class QuestionController {
  async deleteQuestionsByIds(questionIds: any[]) {
    const validQuestionIds = Array.isArray(questionIds)
      ? questionIds.filter((id: any) => !!id)
      : [];
    console.log("Valid question IDs for deletion:", validQuestionIds);

    if (validQuestionIds.length === 0) {
      return {
        requested: 0,
        deleted: 0,
        deletedImages: 0,
      };
    }

    const questions = await QuestionDB.find(
      { _id: { $in: validQuestionIds } },
      { image: 1 }
    ).lean();

    const baseUrl = `${minioConfig.useSSL ? "https" : "http"}://${
      minioConfig.publicEndpoint
    }:${minioConfig.port}/${minioConfig.bucket}/`;

    const imageUrls = [
      ...new Set(
        questions
          .flatMap((question: any) => (Array.isArray(question.image) ? question.image : []))
          .filter((url: any) => typeof url === "string" && url.trim().length > 0)
      ),
    ];

    for (const imageUrl of imageUrls) {
      if (!imageUrl.startsWith(baseUrl)) {
        throw new Error(`INVALID_IMAGE_URL:${imageUrl}`);
      }

      const fileName = imageUrl.replace(baseUrl, "");
      await deleteFile(fileName);
    }

    await QuestionDB.updateMany(
      {},
      {
        $pull: {
          linked: { $in: validQuestionIds },
          questions_list: { $in: validQuestionIds },
        },
      }
    );

    const deleteResult = await QuestionDB.deleteMany({
      _id: { $in: validQuestionIds },
    });

    return {
      requested: validQuestionIds.length,
      deleted: deleteResult.deletedCount ?? 0,
      deletedImages: imageUrls.length,
    };
  }

  async getQuestionsCards(req: Request, res: Response) {
    try {
      const { node_id } = req.params;
      if (!node_id) {
        return res.status(400).json({ message: "node_id is required" });
      }
      const docs = await QuestionDB.find({
        node_id,
        $or: [{ linked: { $exists: false } }, { linked: { $size: 0 } }],
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

  // Fetch multiple questions by an array of questionIds and return previews
  async getLinkedQuestions(req: Request, res: Response) {
    try {
      let { questionIds } = req.body;
      console.log(questionIds);

      // ensure questionIds is an array
      if (!questionIds || !Array.isArray(questionIds)) {
        return res.status(400).json({ message: "questionIds must be an array" });
      }

      // remove any falsy entries just in case
      questionIds = questionIds.filter((v: any) => !!v);

      // if (questionIds.length === 0) {
      //   return res.status(200).json({ data: [] });
      // }

      const docs = await QuestionDB.find({ _id: { $in: questionIds } }).lean();
      const previews: QuestionType[] = docs.map((doc: any) => toQuestion(doc));

      return res.status(200).json({ data: previews });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getQuestionsExceedMaximumSub(req: Request, res: Response) {
    try {
      let { maximum_sub, questionIds } = req.body;

      if (typeof maximum_sub !== "number" || Number.isNaN(maximum_sub)) {
        return res.status(400).json({
          message: "maximum_sub must be a valid number",
        });
      }

      if (!Array.isArray(questionIds)) {
        return res.status(400).json({
          message: "questionIds must be an array",
        });
      }

      maximum_sub = Number(maximum_sub);
      questionIds = questionIds.filter((id: any) => !!id);

      if (questionIds.length === 0) {
        return res.status(200).json({
          data: {
            questionIds: [],
            total: 0,
          },
        });
      }

      const matchedQuestions = await QuestionDB.find(
        {
          _id: { $in: questionIds },
          questions_list: { $type: "array" },
          $expr: { $gt: [{ $size: "$questions_list" }, maximum_sub] },
        },
        { _id: 1 }
      ).lean();

      const matchedQuestionIds = matchedQuestions.map((question: any) => question._id?.toString());

      return res.status(200).json({
        data: {
          questionIds: matchedQuestionIds,
          total: matchedQuestionIds.length,
        },
      });
    } catch (error) {
      console.error("Error checking maximum_sub condition:", error);
      return res.status(500).json({
        message: "Failed to check maximum_sub condition",
        error: error instanceof Error ? error.message : "Unknown error",
      });
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
      const fileName = `images/${uuidv4()}_${Date.now()}.${fileExtension}`;

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

  async createQuestion(req: Request, res: Response) {
    try {
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

      const createdQuestionId = newQuestion._id?.toString();
      const questionsList = Array.isArray((newQuestion as any).questions_list)
        ? (newQuestion as any).questions_list.filter((id: any) => !!id)
        : [];

      if (createdQuestionId && questionsList.length > 0) {
        await QuestionDB.updateMany(
          { _id: { $in: questionsList } },
          { $addToSet: { linked: createdQuestionId } }
        );
      }

      const newQuestionObj = toQuestion(newQuestion);

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

  async addQuestionLink(req: Request, res: Response) {
    try {
      const { parent_id } = req.params;
      const { question_list } = req.body;

      if (!parent_id) {
        return res.status(400).json({ message: "parent_id is required" });
      }

      if (!Array.isArray(question_list)) {
        return res.status(400).json({
          message: "question_list must be an array",
        });
      }

      const validQuestionIds = question_list.filter((id: any) => !!id);

      // if (validQuestionIds.length === 0) {
      //   return res.status(400).json({
      //     message: "question_list must contain at least one question id",
      //   });
      // }

      for (const questionId of validQuestionIds) {
        await QuestionDB.findByIdAndUpdate(
          questionId,
          { $addToSet: { linked: parent_id } },
          { new: true }
        ).lean();
      }

      return res.status(200).json({
        message: "Question links updated successfully",
      });
    } catch (error) {
      console.error("Error adding question links:", error);
      return res.status(500).json({
        message: "Failed to add question links",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async removeQuestionLink(req: Request, res: Response) {
    try {
      const { parent_id } = req.params;
      const { question_list } = req.body;

      if (!parent_id) {
        return res.status(400).json({ message: "parent_id is required" });
      }

      if (!Array.isArray(question_list)) {
        return res.status(400).json({
          message: "question_list must be an array",
        });
      }

      const validQuestionIds = question_list.filter((id: any) => !!id);

      if (validQuestionIds.length === 0) {
        return res.status(400).json({
          message: "question_list must contain at least one question id",
        });
      }

      for (const questionId of validQuestionIds) {
        await QuestionDB.findByIdAndUpdate(
          questionId,
          { $pull: { linked: parent_id } },
          { new: true }
        ).lean();
      }

      return res.status(200).json({
        message: "Question links removed successfully",
      });
    } catch (error) {
      console.error("Error removing question links:", error);
      return res.status(500).json({
        message: "Failed to remove question links",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteImage(req: Request, res: Response) {
    try {
      let { imageUrls } = req.body;

      console.log("Received image URLs for deletion:", imageUrls);

      if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
        return res.status(400).json({
          message: "imageUrls must be a non-empty array",
        });
      }
      console.log("Received image URLs for deletion:", imageUrls);

      if (imageUrls.length === 0) {
        return res.status(200).json({});
      }

      // Construct the base URL from minioConfig
      const baseUrl = `${minioConfig.useSSL ? "https" : "http"}://${
        minioConfig.publicEndpoint
      }:${minioConfig.port}/${minioConfig.bucket}/`;

      const deletedFiles: string[] = [];
      const failedFiles: { url: string; error: string }[] = [];

      for (const imageUrl of imageUrls) {
        try {
          // Extract the fileName from the imageUrl
          if (!imageUrl.startsWith(baseUrl)) {
            failedFiles.push({ url: imageUrl, error: "Invalid image URL" });
            continue;
          }
          const fileName = imageUrl.replace(baseUrl, "");
          console.log(`Attempting to delete file: ${fileName} from MinIO`);
          await deleteFile(fileName);
          console.log(`Successfully deleted file: ${fileName} from MinIO`);
          deletedFiles.push(fileName);
        } catch (error) {
          failedFiles.push({
            url: imageUrl,
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
      const result = await this.deleteQuestionsByIds(questionIds);

      return res.status(200).json({
        message: "Questions deleted successfully",
        data: result,
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
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: "id is required",
        });
      }

      const question = await QuestionDB.findById(id, {
        image: 1,
        questions_list: 1,
        type: 1,
      }).lean();

      console.log("Question to delete:", question);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const groupDeleteResult =
        (question as any).type === "group"
          ? await this.deleteQuestionsByIds((question as any).questions_list)
          : { requested: 0, deleted: 0, deletedImages: 0 };

      const baseUrl = `${minioConfig.useSSL ? "https" : "http"}://${
        minioConfig.publicEndpoint
      }:${minioConfig.port}/${minioConfig.bucket}/`;

      const imageUrls = Array.isArray((question as any).image)
        ? (question as any).image.filter(
            (url: any) => typeof url === "string" && url.trim().length > 0
          )
        : [];

      for (const imageUrl of imageUrls) {
        if (!imageUrl.startsWith(baseUrl)) {
          return res.status(400).json({
            message: "Invalid image URL found while deleting question",
            data: { invalidImageUrl: imageUrl },
          });
        }

        const fileName = imageUrl.replace(baseUrl, "");
        await deleteFile(fileName);
      }

      await QuestionDB.updateMany(
        {},
        {
          $pull: {
            linked: id,
            questions_list: id,
          },
        }
      );

      await QuestionDB.deleteOne({ _id: id });

      return res.status(200).json({
        message: "Question deleted successfully",
        data: {
          deleted: 1,
          deletedImages: imageUrls.length,
          deletedChildren: groupDeleteResult,
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
