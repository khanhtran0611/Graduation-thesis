import { Request, Response } from "express";
import { CourseDB } from "../models/courses.model";
import { AuthorityDB } from "../models/authority.model";
import { toCourse, toOmittedCourse } from "../types/courses";

class CourseController {
  async getOmittedCourses(req: Request, res: Response) {
    try {
      const docs = await CourseDB.find().lean();
      const omittedCourses = docs.map(toOmittedCourse);
      return res.status(200).json({ courses: omittedCourses });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getCoursesForAdmin(req: Request, res: Response) {
    try {
      const docs = await CourseDB.find().lean();
      const courses = docs.map(toCourse);
      return res.status(200).json({ courses });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getCourseCards(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const authorityDoc = await AuthorityDB.findOne({ user_id: userId }).lean();
      const courseIds = (authorityDoc?.course_list || []).map((course) => course.id);
      const docs = await CourseDB.find({ _id: { $in: courseIds } }).lean();
      const courses = docs.map(toCourse);
      return res.status(200).json({ courses });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getCourseById(req: Request, res: Response) {
    try {
      const courseId = req.params.id;
      console.log("Fetching course with ID:", courseId);
      const doc = await CourseDB.findById(courseId).lean();

      if (!doc) {
        return res.status(404).json({ message: "Course not found" });
      }

      const course = toCourse(doc);
      return res.status(200).json({ course });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async createCourse(req: Request, res: Response) {
    try {
      const { subject_name, subject_code, credits, department, description } = req.body;

      const newCourse = new CourseDB({
        subject_name,
        subject_code,
        credits,
        department,
        description,
      });

      const savedCourse = await newCourse.save();
      const course = toCourse(savedCourse.toObject());
      return res.status(201).json({
        message: "Course created successfully",
        course,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async updateCourse(req: Request, res: Response) {
    try {
      const courseId = req.params.id;
      const { subject_name, subject_code, credits, department, description } = req.body;

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
        return res.status(404).json({ message: "Course not found" });
      }

      const courseData = toCourse(updatedCourse);
      return res.status(200).json({
        message: "Course updated successfully",
        course: courseData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async deleteCourse(req: Request, res: Response) {
    try {
      const courseId = req.params.id;
      const deletedCourse = await CourseDB.findByIdAndDelete(courseId);
      if (!deletedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export const courseController = new CourseController();
