import { LogDB } from "../models/log.model";

export const createLog = async (
  user_id: string,
  username: string,
  role: string,
  action: string
): Promise<void> => {
  await LogDB.create({
    user_id,
    username,
    role,
    action,
  });
};
