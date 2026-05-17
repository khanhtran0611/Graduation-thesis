import { IGetCourseCards } from "../interface/course_view.interface";
import { AdminGetCourseCards, UserGetCourseCards } from "../service/course_view.service";

export const CourseViewRegistry: Record<string, new () => IGetCourseCards> = {
  user: UserGetCourseCards,
  admin: AdminGetCourseCards,
};
