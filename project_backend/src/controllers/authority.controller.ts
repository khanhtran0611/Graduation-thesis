import { Request, Response } from "express";
import { AuthorityDB } from "../models/authority.model";
import { toAuthority } from "../types/authority";
import { error, notFound, ok } from "../utils/responseUtils";

class AuthorityController {
  async getCourseAccess(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const courseId = req.params.courseId;

      if (!userId || !courseId) {
        return notFound(res);
      }

      const authority = await AuthorityDB.findOne({ user_id: userId }).lean();
      if (!authority) {
        return notFound(res);
      }

      const course = authority.course_list.find((item) => item.id === courseId);
      if (!course) {
        return notFound(res);
      }

      return ok(res, course.access);
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async getAuthorities(req: Request, res: Response) {
    try {
      const docs = await AuthorityDB.find().lean();
      const authorities = docs.map(toAuthority);
      return ok(res, authorities);
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async getAuthorityById(req: Request, res: Response) {
    try {
      let userId = req.params.id;
      if (!userId) {
        return notFound(res);
      }
      userId = userId.trim();
      const doc = await AuthorityDB.findOne({ user_id: userId }).lean();
      if (!doc) {
        return notFound(res);
      }
      return ok(res, toAuthority(doc));
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async createAuthority(req: Request, res: Response) {
    try {
      const { course_list, user_id } = req.body;
      if (!user_id) {
        return notFound(res);
      }
      const created = await AuthorityDB.create({
        course_list,
        user_id,
      });
      return res.status(201).json({
        success: true,
        status: 201,
        message: "Authority created successfully",
        data: toAuthority(created.toObject()),
      });
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async updateAuthority(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { course_list } = req.body;

      const updated = await AuthorityDB.findByIdAndUpdate(
        id,
        {
          course_list,
        },
        { new: true }
      ).lean();

      if (!updated) {
        return notFound(res);
      }

      return ok(res, toAuthority(updated));
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async deleteAuthority(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const deleted = await AuthorityDB.findByIdAndDelete(id);

      if (!deleted) {
        return notFound(res);
      }

      return ok(res, { message: "Authority deleted successfully" });
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }
}

export const authorityController = new AuthorityController();
