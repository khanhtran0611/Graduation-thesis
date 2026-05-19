import { AdminLogDB } from "../../../models/logAdmin.model";
import { LogDB } from "../../../models/log.model";
import { toLog, toLogAdmin } from "../../../types/log";
import { getLogI } from "../interface/log.interface";

const buildFilter = (
  unit_id?: string,
  user?: string,
  user_id?: string,
  actions?: string,
  time?: string
) => {
  const filter: Record<string, unknown> = {};

  if (unit_id) {
    filter.unit_id = unit_id;
  }

  if (typeof user === "string" && user.trim()) {
    filter.username = { $regex: user.trim(), $options: "i" };
  }

  if (typeof user_id === "string" && user_id.trim()) {
    filter.user_id = { $regex: user_id.trim(), $options: "i" };
  }

  if (typeof actions === "string" && actions.trim()) {
    filter.action = { $regex: actions.trim(), $options: "i" };
  }

  if (typeof time === "string" && time.trim()) {
    filter.$expr = {
      $lte: [
        {
          $dateToString: {
            format: "%Y/%m/%d",
            date: "$createdAt",
          },
        },
        time.trim(),
      ],
    };
  }

  return filter;
};

const paginateAdminLogs = async (filter: Record<string, unknown>, page = 1, limit = 10) => {
  const paginateModel = AdminLogDB as any;
  const paginated = await paginateModel.paginate(filter, {
    page,
    limit,
    sort: { createdAt: -1 },
    lean: true,
  });

  return {
    logs: (paginated.docs || []).map(toLogAdmin),
    currentPage: paginated.page || page,
    limit,
    totalPages: paginated.totalPages || 0,
  };
};

const paginateLogs = async (filter: Record<string, unknown>, page = 1, limit = 10) => {
  const paginateModel = LogDB as any;
  const paginated = await paginateModel.paginate(filter, {
    page,
    limit,
    sort: { createdAt: -1 },
    lean: true,
  });

  return {
    logs: (paginated.docs || []).map(toLog),
    currentPage: paginated.page || page,
    limit,
    totalPages: paginated.totalPages || 0,
  };
};

export const getLogsByCourse = async (
  course_id: string,
  user?: string,
  user_id?: string,
  role?: string,
  actions?: string,
  time?: string,
  page = 1,
  limit = 10
) => {
  const filter = buildFilter(undefined, user, user_id, actions, time);
  filter.course_id = course_id;

  if (role) {
    filter.role = role;
  }

  return paginateLogs(filter, page, limit);
};

export class getSuperAdminLog implements getLogI {
  public async getLog(
    unit_id: string,
    user?: string,
    user_id?: string,
    _role?: string,
    actions?: string,
    time?: string,
    page = 1,
    limit = 10
  ) {
    const filter = buildFilter(undefined, user, user_id, actions, time);
    filter.role = "super admin";
    return paginateAdminLogs(filter, page, limit);
  }
}

export class getAdminLog implements getLogI {
  public async getLog(
    unit_id: string,
    user?: string,
    user_id?: string,
    _role?: string,
    actions?: string,
    time?: string,
    page = 1,
    limit = 10
  ) {
    const filter = buildFilter(unit_id, user, user_id, actions, time);
    filter.role = "admin";
    return paginateAdminLogs(filter, page, limit);
  }
}
