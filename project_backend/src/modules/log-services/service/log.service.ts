import { AdminLogDB } from "../../../models/logAdmin.model";
import { LogDB } from "../../../models/log.model";
import { toLog, toLogAdmin } from "../../../types/log";

class LogService {
  public async addLog(
    user_id: string,
    username: string,
    role: string,
    action: string,
    unit_id?: string
  ) {
    const created = await AdminLogDB.create({
      user_id,
      username,
      role,
      action,
      unit_id,
    });

    return toLogAdmin(created);
  }

  public async addCourseLog(
    user_id: string,
    username: string,
    role: string,
    action: string,
    course_id?: string
  ) {
    const created = await LogDB.create({
      user_id,
      username,
      role,
      action,
      course_id,
    });

    return toLog(created);
  }
}

const logService = new LogService();
export default logService;
