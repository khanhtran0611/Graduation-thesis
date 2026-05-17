import { UserDB } from "../../../models/user.model";
import { UserDocument } from "../../../models/user.model";
import { AuthorityDB } from "../../../models/authority.model";
import { toUser, toUserDetail } from "../../../types/users";
import logService from "../../log-services/service/log.service";

export class ServiceError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class BasicManagementService {
  public async createAccount(
    body: {
      name: string;
      "date of birth": string;
      role: string;
      email: string;
      password: string;
      unit_id: string;
    },
    actor?: { id?: string; name?: string; role?: string; unit_id?: string }
  ) {
    const newUser = await UserDB.create({
      name: body.name,
      "date of birth": body["date of birth"],
      role: body.role,
      email: body.email,
      password: body.password,
      unit_id: body.unit_id,
      required_change: true,
    });

    if (newUser === null) {
      throw new ServiceError(500, "Failed to create account");
    }

    const savedUser = await newUser.save();
    await AuthorityDB.create({ user_id: savedUser._id, course_list: [] });
    if (actor) {
      const createdId = savedUser.id ?? savedUser._id?.toString() ?? "";
      await logService.addLog(
        actor.id ?? "",
        actor.name ?? "",
        actor.role ?? "",
        `created an account with id : ${createdId}`,
        actor.unit_id
      );
    }
    return { message: "Account created successfully", user: toUser(savedUser) };
  }

  public async editAccount(
    id: string,
    body: Record<string, unknown>,
    actor?: { id?: string; name?: string; role?: string; unit_id?: string }
  ) {
    const user = await UserDB.findById(id);
    if (!user) {
      throw new ServiceError(404, "User not found");
    }

    Object.assign(user, body);
    const changedFields = user.modifiedPaths();
    const savedUser = await user.save();

    if (actor) {
      const fieldsLabel = changedFields.length > 0 ? changedFields.join(", ") : "none";
      await logService.addLog(
        actor.id ?? "",
        actor.name ?? "",
        actor.role ?? "",
        `edited account ${id} 's fields: ${fieldsLabel}`,
        actor.unit_id
      );
    }

    return toUserDetail(savedUser as any);
  }

  public async deleteAccount(id: string) {
    const deletedUser = await UserDB.findByIdAndDelete(id);

    if (!deletedUser) {
      throw new ServiceError(404, "User not found");
    }

    return { message: "Account deleted successfully" };
  }
}

const basicManagementService = new BasicManagementService();
export default basicManagementService;
