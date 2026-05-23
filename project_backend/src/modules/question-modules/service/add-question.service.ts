import QuestionDB from "../../../models/question.model"; //
import { toQuestion } from "../../../types/questions"; //
import { IAddQuestionService } from "./interface";

export class AddQuestionServiceV1 implements IAddQuestionService {
  getVersion(): String {
    return "V1";
  }
  async createQuestion(data: any) {
    const newQuestion = await QuestionDB.create(data); //

    return toQuestion(newQuestion); //
  }

  async insertManyQuestion(data: any[]) {
    const newQuestions = await QuestionDB.insertMany(data);
    return newQuestions.map(toQuestion);
  }
}
