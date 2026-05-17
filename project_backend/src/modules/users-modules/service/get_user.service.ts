import { UserDB } from "../../../models/user.model";
import { toUserDetail } from "../../../types/users";
import { IGetUsers } from "../interface/get_user.interface";
import { ServiceError } from "./basic_management.service";

export class GetUsersNormal implements IGetUsers {
  public async getUsers(unitId: string) {
    if (!unitId) {
      throw new ServiceError(400, "unit_id is required");
    }

    const doc = await UserDB.find({ unit_id: unitId }).select("-password").lean();
    const users = doc.map(toUserDetail);
    return { users };
  }
}

export class GetAdminUsers implements IGetUsers {
  public async getUsers(unitId: string) {
    if (!unitId) {
      throw new ServiceError(400, "unit_id is required");
    }

    const doc = await UserDB.find({ role: "admin", unit_id: unitId }).select("-password").lean();
    const users = doc.map(toUserDetail);
    return { users };
  }
}
