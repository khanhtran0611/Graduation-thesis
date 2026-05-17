import { AuthorityDB } from "../../../models/authority.model";
import { CourseDB } from "../../../models/courses.model";
import { UnitDB } from "../../../models/unit.model";
import { toCourse, toCourseInfo, toOmittedCourse } from "../../../types/courses";
import { ServiceError } from "./course_basic_manage.service";

export class ViewManagementService {
  public async getOmittedCourses(unitId?: string) {
    if (!unitId) {
      throw new ServiceError(400, "unit_id is required");
    }

    const docs = await CourseDB.find({ unit_id: unitId }).lean();
    const omittedCourses = docs.map(toOmittedCourse);
    return { courses: omittedCourses };
  }

  public async getCoursesForAdmin() {
    const docs = await CourseDB.find().lean();
    const courses = docs.map(toCourse);
    return { courses };
  }

  public async getCourseCards(userId?: string) {
    if (!userId) {
      throw new ServiceError(400, "user id is required");
    }
    const authorityDoc = await AuthorityDB.findOne({ user_id: userId }).lean();
    const courseIds = (authorityDoc?.course_list || []).map((course: any) => course.id);
    const docs = await CourseDB.find({ _id: { $in: courseIds } }).lean();
    const unitIds = [...new Set(docs.map((doc: any) => doc.unit_id).filter(Boolean))];
    const unitDocs = await UnitDB.find({ _id: { $in: unitIds } }).lean();
    const unitMap = new Map<string, string>();

    unitDocs.forEach((unit: any) => {
      unitMap.set(unit._id.toString(), unit.unit_name);
    });

    const courses = docs.map((doc: any) =>
      toCourseInfo({
        ...doc,
        unit_name: unitMap.get(doc.unit_id) || "",
      })
    );
    return { courses };
  }
}

const viewManagementService = new ViewManagementService();
export default viewManagementService;
