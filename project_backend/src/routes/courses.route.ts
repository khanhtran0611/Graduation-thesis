import express, { Request, Response } from "express";
import { courseController } from "../controllers/courses.controller";
import courseBasicManageController from "../modules/courses-modules/controller/course_basic_manage.controller";
import viewManagementController from "../modules/courses-modules/controller/view_management.controller";
import { authorization } from "../auth/auth.middleware";

export const router = express.Router();

router.get("/", authorization.authenticateToken, (req, res) =>
  viewManagementController.getCourseCards(req, res)
);
router.get("/cards/:id", authorization.authenticateToken, (req, res) =>
  viewManagementController.getOmittedCourses(req, res)
);
router.get("/admin", authorization.authenticateToken, (req, res) =>
  viewManagementController.getCoursesForAdmin(req, res)
);
router.get("/:id", authorization.authenticateToken, (req, res) =>
  courseBasicManageController.getCourseById(req, res)
);
router.post("/", authorization.authenticateToken, (req, res) =>
  courseBasicManageController.createCourse(req, res)
);
router.put("/:id", authorization.authenticateToken, (req, res) =>
  courseBasicManageController.updateCourse(req, res)
);
router.delete("/:id", authorization.authenticateToken, (req, res) =>
  courseBasicManageController.deleteCourse(req, res)
);
