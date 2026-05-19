import QuestionDB from "../../../models/question.model"; //
import { toQuestion, toQuestionCard } from "../../../types/questions";
import { IViewQuestionService } from "./interface";

export class ViewQuestionServiceV1 implements IViewQuestionService {
  getVersion(): string {
    return "v1";
  }

  async getQuestionsCards(nodeId: string, mode?: string) {
    const isArchived = mode === "archive";
    const docs = await QuestionDB.find({ node_id: nodeId, is_archived: isArchived }).lean();
    return docs.map((doc) => toQuestionCard(doc));
  }

  async getQuestionById(id: string) {
    const doc = await QuestionDB.findById(id).lean();
    if (!doc) return null;
    return toQuestion(doc);
  }
}
