import express from "express";
import { authorization } from "../auth/auth.middleware";
import unitController from "../modules/unit-modules/controller/unit.controller";

export const router = express.Router();

router.get("/", authorization.authenticateToken, (req, res) =>
  unitController.getAllUnits(req, res)
);
router.get("/:id/name", authorization.authenticateToken, (req, res) =>
  unitController.getUnitName(req, res)
);
router.post("/", authorization.authenticateToken, (req, res) =>
  unitController.createUnit(req, res)
);
router.put("/:id", authorization.authenticateToken, (req, res) =>
  unitController.updateUnit(req, res)
);
router.delete("/:id", authorization.authenticateToken, (req, res) =>
  unitController.deleteUnit(req, res)
);
