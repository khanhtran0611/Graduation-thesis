import QuestionDB from "../../../models/question.model"; //
import { toQuestion } from "../../../types/questions"; //
import { IUpdateQuestionService } from "./interface";

export class UpdateQuestionServiceV1 implements IUpdateQuestionService {
  getVersion(): String {
    return "V1";
  }
  async updateQuestion(id: string, data: any) {
    const question = await QuestionDB.findById(id);

    if (!question) throw new Error("Question not found");

    Object.assign(question, data);
    const changedFields = question.modifiedPaths();
    const savedQuestion = await question.save();

    return {
      data: toQuestion(savedQuestion),
      changedFields,
    };
  }
}
