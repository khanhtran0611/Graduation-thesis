import { Request, Response } from "express";
import { error, notFound, ok } from "../../../utils/responseUtils";
import accessAuthenticationService, {
  AccessAuthenticationService,
  ServiceError,
} from "../service/access_authentication.service";

class AccessAuthenticationController {
  private service: AccessAuthenticationService;

  constructor() {
    this.service = accessAuthenticationService;
  }

  private handleError(res: Response, err: unknown): Response {
    if (err instanceof ServiceError && err.status === 404) {
      return notFound(res);
    }

    console.error(err);
    return error(res, "Server error");
  }

  public async getCourseAccess(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.id;
      const data = await this.service.getCourseAccess(userId, req.params.courseId);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async getAuthorities(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getAuthorities();
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async getAuthorityById(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getAuthorityById(req.params.id);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }
}

const accessAuthenticationController = new AccessAuthenticationController();
export default accessAuthenticationController;
