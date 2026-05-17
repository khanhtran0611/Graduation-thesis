import { AdminLogDB } from "../../../models/logAdmin.model";
import { toLogAdmin } from "../../../types/log";

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
}

const logService = new LogService();
export default logService;
