import { Request, Response } from "express";
import { ok, invalidated } from "../../../utils/responseUtils";
import { LogRegistry } from "../interface/log.registry";
import { getLogI } from "../interface/log.interface";
import { getLogsByCourse } from "../service/get_log.service";
import logService from "../service/log.service";

class LogController {
  public async getLogs(req: Request, res: Response): Promise<Response> {
    const unit_id = req.query.unit_id?.toString() ?? "";
    const user = req.query.user?.toString() ?? "";
    const user_id = req.query.user_id?.toString() ?? "";
    const queryRole = req.query.role?.toString() ?? "";
    const actions = req.query.actions?.toString() ?? "";
    const time = req.query.time?.toString() ?? "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    console.log("Received log query with parameters:", req.query);

    const LogServiceClass = queryRole ? LogRegistry[queryRole] : undefined;
    if (!LogServiceClass) {
      return invalidated(res, { message: "role is required" });
    }

    if (!unit_id && queryRole === "admin") {
      return invalidated(res, { message: "unit_id is required" });
    }

    const logService: getLogI = new LogServiceClass();
    const data = await logService.getLog(
      unit_id,
      user,
      user_id,
      queryRole,
      actions,
      time,
      page,
      limit
    );
    return ok(res, data);
  }

  public async getLogsByCourse(req: Request, res: Response): Promise<Response> {
    const course_id = req.query.course_id?.toString() ?? "";
    const user = req.query.user?.toString() ?? "";
    const user_id = req.query.user_id?.toString() ?? "";
    const queryRole = req.query.role?.toString() ?? "";
    const actions = req.query.actions?.toString() ?? "";
    const time = req.query.time?.toString() ?? "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!queryRole) {
      return invalidated(res, { message: "role is required" });
    }

    if (!course_id) {
      return invalidated(res, { message: "course_id is required" });
    }

    const data = await getLogsByCourse(
      course_id,
      user,
      user_id,
      queryRole,
      actions,
      time,
      page,
      limit
    );
    return ok(res, data);
  }

  public async addCourseLog(req: Request, res: Response): Promise<Response> {
    const { user_id, username, role, action, course_id } = req.body as {
      user_id?: string;
      username?: string;
      role?: string;
      action?: string;
      course_id?: string;
    };

    if (!user_id || !username || !role || !action) {
      return invalidated(res, { message: "user_id, username, role, action are required" });
    }

    const data = await logService.addCourseLog(user_id, username, role, action, course_id);
    return ok(res, data);
  }
}

const logController = new LogController();
export default logController;
