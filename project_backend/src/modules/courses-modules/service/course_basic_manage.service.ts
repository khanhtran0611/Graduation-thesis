import { CourseDB } from "../../../models/courses.model";
import { toCourse } from "../../../types/courses";

export class ServiceError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class CourseBasicManageService {
  public async getCourseById(courseId: string) {
    if (!courseId) {
      throw new ServiceError(400, "course id is required");
    }

    const doc = await CourseDB.findById(courseId).lean();
    if (!doc) {
      throw new ServiceError(404, "Course not found");
    }

    return { course: toCourse(doc) };
  }

  public async createCourse(body: {
    subject_name: string;
    subject_code: string;
    credits: number;
    department: string;
    description: string;
  }) {
    const { subject_name, subject_code, credits, department, description } = body;

    const newCourse = new CourseDB({
      subject_name,
      subject_code,
      credits,
      department,
      description,
    });

    const savedCourse = await newCourse.save();
    return {
      message: "Course created successfully",
      course: toCourse(savedCourse.toObject()),
    };
  }

  public async updateCourse(
    courseId: string,
    body: {
      subject_name: string;
      subject_code: string;
      credits: number;
      department: string;
      description: string;
    }
  ) {
    if (!courseId) {
      throw new ServiceError(400, "course id is required");
    }

    const { subject_name, subject_code, credits, department, description } = body;
    const updatedCourse = await CourseDB.findByIdAndUpdate(
      courseId,
      {
        subject_name,
        subject_code,
        credits,
        department,
        description,
      },
      { new: true }
    ).lean();

    if (!updatedCourse) {
      throw new ServiceError(404, "Course not found");
    }

    return {
      message: "Course updated successfully",
      course: toCourse(updatedCourse),
    };
  }

  public async deleteCourse(courseId: string) {
    if (!courseId) {
      throw new ServiceError(400, "course id is required");
    }

    const deletedCourse = await CourseDB.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      throw new ServiceError(404, "Course not found");
    }

    return { message: "Course deleted successfully" };
  }
}

const courseBasicManageService = new CourseBasicManageService();
export default courseBasicManageService;
