import { AuthorityDB } from "../../../models/authority.model";
import { toAuthority } from "../../../types/authority";
import logService from "../../log-services/service/log.service";

export class ServiceError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class BasicManagementService {
  public async createAuthority(body: { course_list: unknown; user_id: string }) {
    const { course_list, user_id } = body;
    if (!user_id) {
      throw new ServiceError(404, "Not found");
    }

    const created = await AuthorityDB.create({
      course_list,
      user_id,
    });

    return toAuthority(created.toObject());
  }

  public async updateAuthority(
    id: string,
    body: { course_list: unknown },
    actor?: { id?: string; name?: string; role?: string; unit_id?: string }
  ) {
    const { course_list } = body;

    const updated = await AuthorityDB.findByIdAndUpdate(id, { course_list }, { new: true }).lean();

    if (!updated) {
      throw new ServiceError(404, "Not found");
    }

    if (actor) {
      await logService.addLog(
        actor.id ?? "",
        actor.name ?? "",
        actor.role ?? "",
        `update authority of user with id : ${updated.user_id}`,
        actor.unit_id
      );
    }

    return toAuthority(updated);
  }

  public async deleteAuthority(id: string) {
    const deleted = await AuthorityDB.findByIdAndDelete(id);

    if (!deleted) {
      throw new ServiceError(404, "Not found");
    }

    return { message: "Authority deleted successfully" };
  }
}

const basicManagementService = new BasicManagementService();
export default basicManagementService;
