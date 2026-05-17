import { getAdminLog, getSuperAdminLog } from "../service/get_log.service";

export const LogRegistry: Record<string, new () => { getLog: (...args: any[]) => any }> = {
  admin: getAdminLog,
  "super admin": getSuperAdminLog,
};
