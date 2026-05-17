import express from "express";
import { courseHierarchyController } from "../controllers/courses_hierarchy.controller";
import courseStructureController from "../modules/course_structure-modules/controller/course_structure.controller";
import { authorization } from "../auth/auth.middleware";

export const router = express.Router();

router.get("/course/:courseId", authorization.authenticateToken, (req, res) =>
  courseStructureController.getCourseHierarchy(req, res)
);
router.post("/tree-node", authorization.authenticateToken, (req, res) =>
  courseStructureController.addTreeNode(req, res)
);
router.get("/tree-node/:id", authorization.authenticateToken, (req, res) =>
  courseStructureController.getTreeNodeById(req, res)
);
router.put("/tree-node", authorization.authenticateToken, (req, res) =>
  courseStructureController.updateTreeNode(req, res)
);
router.delete("/tree-node/:id", authorization.authenticateToken, (req, res) =>
  courseStructureController.deleteTreeNode(req, res)
);
