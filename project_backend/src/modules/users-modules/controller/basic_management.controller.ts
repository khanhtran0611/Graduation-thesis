import { Request, Response } from "express";
import { error, invalidated, notFound, ok } from "../../../utils/responseUtils";
import basicManagementService, {
  BasicManagementService,
  ServiceError,
} from "../service/basic_management.service";

class BasicManagementController {
  private service: BasicManagementService;

  constructor() {
    this.service = basicManagementService;
  }

  private handleError(res: Response, err: unknown): Response {
    if (err instanceof ServiceError) {
      if (err.status === 404) {
        return notFound(res);
      }

      if (err.status === 400) {
        return invalidated(res, { message: err.message });
      }

      return error(res, err.message);
    }

    console.error(err);
    return error(res, "Server error");
  }

  public async createAccount(req: Request, res: Response): Promise<Response> {
    try {
      const actor = (req as any).user;
      const data = await this.service.createAccount(req.body, actor);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async editAccount(req: Request, res: Response): Promise<Response> {
    try {
      const actor = (req as any).user;
      const data = await this.service.editAccount(req.params.id, req.body, actor);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async deleteAccount(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.deleteAccount(req.params.id);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }
}

const basicManagementController = new BasicManagementController();
export default basicManagementController;
