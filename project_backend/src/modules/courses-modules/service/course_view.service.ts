import { AuthorityDB } from "../../../models/authority.model";
import { CourseDB } from "../../../models/courses.model";
import { toCourse } from "../../../types/courses";
import { IGetCourseCards } from "../interface/course_view.interface";
import { ServiceError } from "./course_basic_manage.service";

export class UserGetCourseCards implements IGetCourseCards {
  getRole(): string {
    return "user";
  }

  async getCourseCards(userId: string): Promise<{ courses: unknown[] }> {
    if (!userId) {
      throw new ServiceError(400, "user id is required");
    }

    const authorityDoc = await AuthorityDB.findOne({ user_id: userId }).lean();
    const courseIds = (authorityDoc?.course_list || []).map((course: any) => course.id);
    const docs = await CourseDB.find({ _id: { $in: courseIds } }).lean();
    const courses = docs.map(toCourse);
    return { courses };
  }
}

export class AdminGetCourseCards implements IGetCourseCards {
  getRole(): string {
    return "admin";
  }

  async getCourseCards(_userId: string): Promise<{ courses: unknown[] }> {
    const docs = await CourseDB.find().lean();
    const courses = docs.map(toCourse);
    return { courses };
  }
}
