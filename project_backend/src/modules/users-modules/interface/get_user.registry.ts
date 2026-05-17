import { IGetUsers } from "./get_user.interface";
import { GetAdminUsers, GetUsersNormal } from "../service/get_user.service";

export const GetUserRegistry: Record<string, new () => IGetUsers> = {
  admin: GetUsersNormal,
  "super admin": GetAdminUsers,
};
