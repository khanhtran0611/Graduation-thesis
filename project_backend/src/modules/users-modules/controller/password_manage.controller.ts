import { Request, Response } from "express";
import { error, notFound, ok, unauthorized } from "../../../utils/responseUtils";
import passwordManageService, { PasswordManageService } from "../service/password_manage.service";
import { ServiceError } from "../service/basic_management.service";

class PasswordManageController {
  private service: PasswordManageService;

  constructor() {
    this.service = passwordManageService;
  }

  private handleError(res: Response, err: unknown): Response {
    if (err instanceof ServiceError) {
      if (err.status === 401) {
        return unauthorized(res, err.message);
      }

      if (err.status === 404) {
        return notFound(res);
      }

      return error(res, err.message);
    }

    console.error(err);
    return error(res, "Server error");
  }

  public async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.id;
      const data = await this.service.changePassword(userId, req.body);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.resetPassword(req.params.user_id, req.body);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async resetPassword2(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.resetPassword2(req.params.user_id);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }
}

const passwordManageController = new PasswordManageController();
export default passwordManageController;
