import { Request, Response } from "express";
import { error, notFound, ok } from "../../../utils/responseUtils";
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
    if (err instanceof ServiceError && err.status === 404) {
      return notFound(res);
    }

    console.error(err);
    return error(res, "Server error");
  }

  public async createAuthority(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.createAuthority(req.body);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async updateAuthority(req: Request, res: Response): Promise<Response> {
    try {
      const actor = (req as any).user;
      const data = await this.service.updateAuthority(req.params.id, req.body, actor);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async deleteAuthority(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.deleteAuthority(req.params.id);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }
}

const basicManagementController = new BasicManagementController();
export default basicManagementController;
