import QuestionDB from "../../../models/question.model"; //
import { sharedFileService } from "../../common/image-managment/service/image.service";
import { IDeleteQuestionService } from "./interface";

export class DeleteQuestionServiceV1 implements IDeleteQuestionService {
  getVersion(): String {
    return "V1";
  }
  private async collectImages(question: any): Promise<string[]> {
    const names: string[] = [];
    if (question?.image)
      names.push(...(Array.isArray(question.image) ? question.image : [question.image]));
    question?.options?.forEach((opt: any) => {
      if (opt?.image) names.push(opt.image);
    });
    question?.questions_list?.forEach((sub: any) => {
      if (sub?.image) names.push(sub.image);
      sub?.options?.forEach((opt: any) => {
        if (opt?.image) names.push(opt.image);
      });
    });
    return [...new Set(names.filter(Boolean))]; //
  }

  async deleteOneQuestion(id: string) {
    const question = await QuestionDB.findById(id).lean(); //
    if (!question) return { deleted: false, deletedImages: 0 };

    const imageFileNames = await this.collectImages(question); //
    await sharedFileService.removeManyImages(imageFileNames); // Gọi service chung để xóa ảnh

    await QuestionDB.deleteOne({ _id: id }); //

    return { deleted: true, deletedImages: imageFileNames.length };
  }

  async deleteManyQuestion(ids: string[]) {
    let deleted = 0;
    let deletedImages = 0;

    for (const id of ids) {
      const result = await this.deleteOneQuestion(id);
      if (result.deleted) {
        deleted += 1;
        deletedImages += result.deletedImages;
      }
    }

    return { requested: ids.length, deleted, deletedImages };
  }

  async archiveOneQuestion(id: string) {
    const question = await QuestionDB.findByIdAndUpdate(
      id,
      { $set: { is_archived: true } },
      { new: true }
    ).lean();

    if (!question) throw new Error("Question not found");

    return { archived: true, id };
  }

  async archiveManyQuestions(ids: string[]) {
    const result = await QuestionDB.updateMany(
      { _id: { $in: ids } },
      { $set: { is_archived: true } }
    );

    return {
      requested: ids.length,
      archived: result.modifiedCount,
    };
  }

  async restoreOneQuestion(id: string) {
    const question = await QuestionDB.findByIdAndUpdate(
      id,
      { $set: { is_archived: false } },
      { new: true }
    ).lean();

    if (!question) throw new Error("Question not found");

    return { restored: true, id };
  }

  async restoreManyQuestions(ids: string[]) {
    const result = await QuestionDB.updateMany(
      { _id: { $in: ids } },
      { $set: { is_archived: false } }
    );

    return {
      requested: ids.length,
      restored: result.modifiedCount,
    };
  }
}
