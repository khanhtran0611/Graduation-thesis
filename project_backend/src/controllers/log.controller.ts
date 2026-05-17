import { Request, Response } from "express";
import { LogDB } from "../models/log.model";
import { toLog } from "../types/log";
import { ok } from "../utils/responseUtils";

class LogController {
  async getLogs(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const { user, role, actions, time } = req.query;

      const filter: Record<string, unknown> = {};

      if (typeof user === "string" && user.trim()) {
        filter.username = { $regex: user.trim(), $options: "i" };
      }

      if (typeof role === "string" && role.trim()) {
        filter.role = { $regex: role.trim(), $options: "i" };
      }

      if (typeof actions === "string" && actions.trim()) {
        filter.action = actions.trim();
      }

      if (typeof time === "string" && time.trim()) {
        filter.$expr = {
          $eq: [
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

      const paginateModel = LogDB as any;
      const paginated = await paginateModel.paginate(filter, {
        page,
        limit,
        sort: { createdAt: -1 },
        lean: true,
      });

      return ok(res, {
        logs: (paginated.docs || []).map(toLog),
        currentPage: paginated.page || page,
        limit,
        totalPages: paginated.totalPages || 0,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export const logController = new LogController();
