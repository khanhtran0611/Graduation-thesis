import express, { Request, Response } from "express";
import { userController } from "../controllers/users.controller";

export const router = express.Router();

router.post("/login", userController.login);
router.get("/getAllUsers", userController.getAllUsers);
router.post("/createAccount", userController.createAccount);
router.post("edit/:id", userController.editAccount);
