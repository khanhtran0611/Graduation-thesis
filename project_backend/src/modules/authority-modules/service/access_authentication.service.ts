import { AuthorityDB } from "../../../models/authority.model";
import { toAuthority } from "../../../types/authority";

export class ServiceError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class AccessAuthenticationService {
  public async getCourseAccess(userId: string | undefined, courseId: string | undefined) {
    if (!userId || !courseId) {
      throw new ServiceError(404, "Not found");
    }

    const authority = await AuthorityDB.findOne({ user_id: userId }).lean();
    if (!authority) {
      throw new ServiceError(404, "Not found");
    }

    const course = authority.course_list.find((item) => item.id === courseId);
    if (!course) {
      return false;
    }

    return course.access;
  }

  public async getAuthorities() {
    const docs = await AuthorityDB.find().lean();
    return docs.map(toAuthority);
  }

  public async getAuthorityById(userId: string | undefined) {
    if (!userId) {
      throw new ServiceError(404, "Not found");
    }

    const trimmedId = userId.trim();
    const doc = await AuthorityDB.findOne({ user_id: trimmedId }).lean();
    if (!doc) {
      throw new ServiceError(404, "Not found");
    }

    return toAuthority(doc);
  }
}

const accessAuthenticationService = new AccessAuthenticationService();
export default accessAuthenticationService;
