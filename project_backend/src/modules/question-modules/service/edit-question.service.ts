import QuestionDB from "../../../models/question.model"; //
import { toQuestion } from "../../../types/questions"; //
import { IUpdateQuestionService } from "./interface";

export class UpdateQuestionServiceV1 implements IUpdateQuestionService {
  getVersion(): String {
    return "V1";
  }
  async updateQuestion(id: string, data: any) {
    const updatedQuestion = await QuestionDB.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean(); //

    if (!updatedQuestion) throw new Error("Question not found");

    return toQuestion(updatedQuestion); //
  }
}
