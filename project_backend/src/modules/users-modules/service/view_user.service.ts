import { UserDB } from "../../../models/user.model";
import { AuthorityDB } from "../../../models/authority.model";
import { toUser, toUserDetail } from "../../../types/users";
import { ServiceError } from "./basic_management.service";

export class ViewUserService {
  public async getAllUsers(unitId?: string) {
    if (!unitId) {
      throw new ServiceError(400, "unit_id is required");
    }

    const doc = await UserDB.find({ unit_id: unitId }).select("-password").lean();
    const users = doc.map(toUser);
    return { users };
  }

  public async getAllUsersNoPassword() {
    const doc = await UserDB.find().select("-password").lean();
    return doc.map(toUserDetail);
  }

  public async getAdminUsers(unitId?: string) {
    if (!unitId) {
      throw new ServiceError(400, "unit_id is required");
    }

    const doc = await UserDB.find({ role: "admin", unit_id: unitId }).select("-password").lean();
    const users = doc.map(toUser);
    return { users };
  }

  public async getUserInfo(userId?: string) {
    if (!userId) {
      throw new ServiceError(401, "Missing user id");
    }

    const user = await UserDB.findById(userId).select("-password").lean();
    if (!user) {
      throw new ServiceError(404, "User not found");
    }

    return toUserDetail(user);
  }

  public async getUserInfoWithCourses(userId?: string) {
    if (!userId) {
      throw new ServiceError(401, "Missing user id");
    }

    const user = await UserDB.findById(userId).select("-password").lean();
    if (!user) {
      throw new ServiceError(404, "User not found");
    }

    const authority = await AuthorityDB.findOne({ user_id: userId }).lean();

    return {
      ...toUserDetail(user),
      course_list: authority?.course_list ?? [],
    };
  }
}

const viewUserService = new ViewUserService();
export default viewUserService;
