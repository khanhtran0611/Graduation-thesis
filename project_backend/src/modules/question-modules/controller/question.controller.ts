import { Request, Response } from "express";
import ResponseUtils from "../../../utils/responseUtils";
import { createLog } from "../../../utils/logUtils";
import { IAddQuestionService } from "../service/interface";
import { IUpdateQuestionService } from "../service/interface";
import { IViewQuestionService } from "../service/interface";
import { IDeleteQuestionService } from "../service/interface";
import { AddServiceRegistry } from "../service-registry/add-question.registry";
import { UpdateServiceRegistry } from "../service-registry/edit-question.registry";
import { ViewServiceRegistry } from "../service-registry/view-question.registry";
import { DeleteServiceRegistry } from "../service-registry/delete-question.registry";

export class QuestionController {
  private static readonly ADD_VER = "V1";
  private static readonly UPDATE_VER = "V1";
  private static readonly VIEW_VER = "V1";
  private static readonly DELETE_VER = "V1";

  private addService: IAddQuestionService;
  private updateService: IUpdateQuestionService;
  private viewService: IViewQuestionService;
  private deleteService: IDeleteQuestionService;

  constructor() {
    // 2. Tự động khởi tạo service từ registry tương ứng
    this.addService = new AddServiceRegistry[QuestionController.ADD_VER]();
    this.updateService = new UpdateServiceRegistry[QuestionController.UPDATE_VER]();
    this.viewService = new ViewServiceRegistry[QuestionController.VIEW_VER]();
    this.deleteService = new DeleteServiceRegistry[QuestionController.DELETE_VER]();
  }

  // Hàm helper ghi log
  private async log(req: Request, action: string) {
    const user = (req as any).user;
    await createLog(user?.id || "", user?.name || user?.username || "", user?.role || "", action);
  }

  // --- VIEW (KHÔNG LOG) ---
  getQuestionById = async (req: Request, res: Response) => {
    try {
      const data = await this.viewService.getQuestionById(req.params.id);
      return data ? ResponseUtils.ok(res, data) : ResponseUtils.notFound(res);
    } catch (e: any) {
      return ResponseUtils.error(res, e.message);
    }
  };

  getQuestionsCards = async (req: Request, res: Response) => {
    try {
      const data = await this.viewService.getQuestionsCards(req.params.node_id);
      return ResponseUtils.ok(res, data);
    } catch (e: any) {
      return ResponseUtils.error(res, e.message);
    }
  };

  // --- MODIFY (CÓ LOG DƯỚI CHÂN HÀM) ---
  createQuestion = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const result = await this.addService.createQuestion(req.body, user);
      await this.log(req, "CREATE_QUESTION"); // <--- Log dưới chân hàm
      return ResponseUtils.ok(res, result);
    } catch (e: any) {
      return ResponseUtils.error(res, e.message);
    }
  };

  updateQuestion = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const result = await this.updateService.updateQuestion(req.params.id, req.body, user);
      await this.log(req, "UPDATE_QUESTION"); // <--- Log dưới chân hàm
      return ResponseUtils.ok(res, result);
    } catch (e: any) {
      return ResponseUtils.error(res, e.message);
    }
  };

  deleteOneQuestion = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const result = await this.deleteService.deleteOneQuestion(req.params.id, user);
      if (result.deleted) {
        await this.log(req, "DELETE_ONE_QUESTION"); // <--- Log dưới chân hàm
        return ResponseUtils.ok(res, result);
      }
      return ResponseUtils.notFound(res);
    } catch (e: any) {
      return ResponseUtils.error(res, e.message);
    }
  };

  deleteManyQuestion = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { questionIds } = req.body;
      const result = await this.deleteService.deleteManyQuestion(questionIds, user);

      await this.log(req, "DELETE_MANY_QUESTION"); // <--- Log dưới chân hàm
      return ResponseUtils.ok(res, result);
    } catch (e: any) {
      return ResponseUtils.error(res, e.message);
    }
  };
}

export const questionController = new QuestionController();
