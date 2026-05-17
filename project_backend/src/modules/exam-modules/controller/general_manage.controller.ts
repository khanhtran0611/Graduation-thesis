import { Request, Response } from "express";
import { ok } from "../../../utils/responseUtils";
import generalManageService, {
  GeneralManageService,
  ServiceError,
} from "../service/general_manage.service";

type GenerateExamCodesRequestBody = {
  id: string;
  desired_codes: number;
};

type FindExamByCodeRequestBody = {
  id: string;
  code: string;
};

type FindExamsByRootIdRequestBody = {
  id: string;
};

class GeneralManageController {
  private service: GeneralManageService;

  constructor() {
    this.service = generalManageService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof ServiceError) {
      return res.status(error.status).json(error.body);
    }

    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

  public async getExamQuestions(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getExamQuestions(req.params.id);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async generateExamCodes(req: Request, res: Response): Promise<Response> {
    try {
      const { id, desired_codes } = req.body as GenerateExamCodesRequestBody;
      const data = await this.service.generateExamCodes(id, desired_codes);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async getExamIdByRootAndCode(req: Request, res: Response): Promise<Response> {
    try {
      const { id, code } = req.body as FindExamByCodeRequestBody;
      const data = await this.service.getExamIdByRootAndCode(id, code);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async getExamCodesByRootId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.body as FindExamsByRootIdRequestBody;
      const data = await this.service.getExamCodesByRootId(id);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async deleteExamById(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.deleteExamById(req.params.id);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async getRootExamsByCourseId(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getRootExamsByCourseId(req.params.course_id);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

const generalManageController = new GeneralManageController();
export default generalManageController;
