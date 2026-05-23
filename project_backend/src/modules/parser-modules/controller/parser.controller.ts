import { Request, Response } from "express";
import { parseAikenStateMachine } from "../service/parser.service";
import ResponseUtils from "../../../utils/responseUtils";
import { AddServiceRegistry } from "../../question-modules/service-registry/add-question.registry";
import { IAddQuestionService } from "../../question-modules/service/interface";

class ParserController {
  private addService: IAddQuestionService;

  constructor() {
    this.addService = new AddServiceRegistry["V1"]();
  }

  uploadAikenFile = async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { node_id } = req.params;

      if (!file) {
        return ResponseUtils.error(res, "No file uploaded.");
      }

      if (!node_id) {
        return ResponseUtils.error(res, "node_id is required.");
      }

      const fileContent = file.buffer.toString("utf-8");
      const parseResult = parseAikenStateMachine(fileContent);

      if (!parseResult.success || !parseResult.data) {
        return ResponseUtils.error(res, parseResult.error || "Failed to parse file.");
      }

      const questions = parseResult.data.map(q => ({
        ...q,
        node_id
      }));

      const user = (req as any).user;
      const result = await this.addService.insertManyQuestion(questions, user);

      return ResponseUtils.ok(res, result);
    } catch (e: any) {
      return ResponseUtils.error(res, e.message);
    }
  };
}

export const parserController = new ParserController();
