import { Request, Response } from "express";
import jwtToken from "../auth/auth.services";
import { CourseDB } from "../models/courses.model";
import { Course } from "../types/courses";
import { toCourseCardDisplay, toCourse } from "../types/courses";

class CourseController {
  async getCourseCards(req: Request, res: Response) {
    try {
      const docs = await CourseDB.find().lean();
      const courseCards = docs.map(toCourseCardDisplay);
      return res.status(200).json({ courses: courseCards });
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

      // Validation
      if (!subject_name || !subject_code || !credits || !department || !description) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if course with same subject_code already exists
      const existingCourse = await CourseDB.findOne({ subject_code });
      if (existingCourse) {
        return res.status(409).json({ message: "Course with this subject code already exists" });
      }

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

      // Check if course exists
      const course = await CourseDB.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // If subject_code is being changed, check if new code already exists
      if (subject_code && subject_code !== course.subject_code) {
        const existingCourse = await CourseDB.findOne({ subject_code });
        if (existingCourse) {
          return res.status(409).json({ message: "Course with this subject code already exists" });
        }
      }

      // Update course
      const updatedCourse = await CourseDB.findByIdAndUpdate(
        courseId,
        {
          subject_name: subject_name || course.subject_name,
          subject_code: subject_code || course.subject_code,
          credits: credits || course.credits,
          department: department || course.department,
          description: description || course.description,
        },
        { new: true }
      ).lean();

      const courseData = toCourse(updatedCourse!);
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
