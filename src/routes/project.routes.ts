import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  saveProject,
  updateProject,
} from "../controllers/projectController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { UserRole } from "../types/enum.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validations/project.validation.js";
import { validate } from "../middlewares/validate.js";
const router = Router();
router.post(
  "/",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  validate(createProjectSchema),
  createProject,
);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  validate(updateProjectSchema),
  updateProject,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  deleteProject,
);
router.post(
  "/:id/save",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  saveProject,
);
export default router;
