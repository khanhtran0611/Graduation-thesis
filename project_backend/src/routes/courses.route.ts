import express, { Request, Response } from "express";
import { courseController } from "../controllers/courses.controller";

export const router = express.Router();

router.get("/", courseController.getCourseCards);
router.get("/:id", courseController.getCourseById);
router.post("/", courseController.createCourse);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);
