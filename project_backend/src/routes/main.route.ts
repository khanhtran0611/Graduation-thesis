import express from "express";
import { courseHierarchyController } from "../controllers/courses_hierarchy.controller";

export const router = express.Router();

router.get("/course/:courseId", courseHierarchyController.getCourseHierarchy);
router.post("/tree-node", courseHierarchyController.addTreeNode);
router.get("/tree-node/:id", courseHierarchyController.getTreeNodeById);
router.put("/tree-node", courseHierarchyController.updateTreeNode);
router.delete("/tree-node/:id", courseHierarchyController.deleteTreeNode);
