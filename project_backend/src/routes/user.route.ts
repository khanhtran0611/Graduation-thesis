import express, { Request, Response } from "express";
import { userController } from "../controllers/users.controller";
import basicManagementController from "../modules/users-modules/controller/basic_management.controller";
import passwordManageController from "../modules/users-modules/controller/password_manage.controller";
import signinController from "../modules/users-modules/controller/signin.controller";
import viewUserController from "../modules/users-modules/controller/view_user.controller";
import { authorization } from "../auth/auth.middleware";

export const router = express.Router();

router.post("/login", (req, res) => signinController.login(req, res));
router.get("/users/:unit_id", authorization.authenticateToken, (req, res) =>
  viewUserController.getAllUsers(req, res)
);

router.get("/users/admin/:unit_id", authorization.authenticateToken, (req, res) =>
  viewUserController.getAdminUsers(req, res)
);

router.post("/user/", authorization.authenticateToken, (req, res) =>
  basicManagementController.createAccount(req, res)
);
router.put("/user/:id", authorization.authenticateToken, (req, res) =>
  basicManagementController.editAccount(req, res)
);
router.delete("/user/:id", authorization.authenticateToken, (req, res) =>
  basicManagementController.deleteAccount(req, res)
);
router.get("/me", authorization.authenticateToken, (req, res) =>
  viewUserController.getUserInfo(req, res)
);
router.get("/me/with-courses", authorization.authenticateToken, (req, res) =>
  viewUserController.getUserInfoWithCourses(req, res)
);
router.post("/change-password", authorization.authenticateToken, (req, res) =>
  passwordManageController.changePassword(req, res)
);
router.post("/reset-password/:user_id", authorization.authenticateToken, (req, res) =>
  passwordManageController.resetPassword(req, res)
);
router.post("/reset-password2/:user_id", authorization.authenticateToken, (req, res) =>
  passwordManageController.resetPassword2(req, res)
);
router.post("/log-out", (req, res) => signinController.logout(req, res));
router.post("/log-out-all", authorization.authenticateToken, (req, res) =>
  signinController.logoutAll(req, res)
);
