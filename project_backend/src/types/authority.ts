import { OmittedCourse2, toOmittedCourse2 } from "./courses";

export type Authority = {
  id: string;
  course_list: OmittedCourse2[];
  user_id: string;
};

export const toAuthority = (doc: any): Authority => ({
  id: doc.id ?? doc._id?.toString(),
  course_list: doc.course_list.map(toOmittedCourse2),
  user_id: doc.user_id,
});
