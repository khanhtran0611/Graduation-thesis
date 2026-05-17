import express from "express";
import { authorization } from "../auth/auth.middleware";
import { authorityController } from "../controllers/authority.controller";
import accessAuthenticationController from "../modules/authority-modules/controller/access_authentication.controller";
import basicManagementController from "../modules/authority-modules/controller/basic_management.controller";

export const router = express.Router();

router.get("/", authorization.authenticateToken, (req, res) =>
  accessAuthenticationController.getAuthorities(req, res)
);
router.get("/access/:courseId", authorization.authenticateToken, (req, res) =>
  accessAuthenticationController.getCourseAccess(req, res)
);
router.get("/:id", authorization.authenticateToken, (req, res) =>
  accessAuthenticationController.getAuthorityById(req, res)
);
router.post("/", authorization.authenticateToken, (req, res) =>
  basicManagementController.createAuthority(req, res)
);
router.put("/:id", authorization.authenticateToken, (req, res) =>
  basicManagementController.updateAuthority(req, res)
);
router.delete("/:id", authorization.authenticateToken, (req, res) =>
  basicManagementController.deleteAuthority(req, res)
);
