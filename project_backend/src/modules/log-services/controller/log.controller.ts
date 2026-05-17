import { Request, Response } from "express";
import { ok, invalidated } from "../../../utils/responseUtils";
import { LogRegistry } from "../interface/log.registry";
import { getLogI } from "../interface/log.interface";

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
}

const logController = new LogController();
export default logController;
