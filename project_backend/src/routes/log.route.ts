import express from "express";
import logController from "../modules/log-services/controller/log.controller";
import { authorization } from "../auth/auth.middleware";

export const router = express.Router();

router.get("/", authorization.authenticateToken, (req, res) => logController.getLogs(req, res));
