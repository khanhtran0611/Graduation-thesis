import { Request, Response } from "express";
import { error, invalidated, notFound, ok, unauthorized } from "../../../utils/responseUtils";
import viewUserService, { ViewUserService } from "../service/view_user.service";
import { ServiceError } from "../service/basic_management.service";
import { IGetUsers } from "../interface/get_user.interface";
import { GetUserRegistry } from "../interface/get_user.registry";

class ViewUserController {
  private service: ViewUserService;

  constructor() {
    this.service = viewUserService;
  }

  private handleError(res: Response, err: unknown): Response {
    if (err instanceof ServiceError) {
      if (err.status === 401) {
        return unauthorized(res, err.message);
      }

      if (err.status === 400) {
        return invalidated(res, { message: err.message });
      }

      if (err.status === 404) {
        return notFound(res);
      }

      return error(res, err.message);
    }

    console.error(err);
    return error(res, "Server error");
  }

  public async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const unitId = req.params.unit_id;
      const role = req.query.role?.toString();
      console.log("Role query parameter:", role);
      console.log("Unit ID parameter:", unitId);
      const GetUsersService = role ? GetUserRegistry[role] : undefined;

      if (!GetUsersService) {
        return invalidated(res, { message: "user is not allowed" });
      }

      const getUsersService: IGetUsers = new GetUsersService();
      const data = await getUsersService.getUsers(unitId);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async getAllUsersNoPassword(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getAllUsersNoPassword();
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async getAdminUsers(req: Request, res: Response): Promise<Response> {
    try {
      const unitId = req.params.unit_id;
      const data = await this.service.getAdminUsers(unitId);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async getUserInfo(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.id;
      const data = await this.service.getUserInfo(userId);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async getUserInfoWithCourses(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.id;
      const data = await this.service.getUserInfoWithCourses(userId);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }
}

const viewUserController = new ViewUserController();
export default viewUserController;
