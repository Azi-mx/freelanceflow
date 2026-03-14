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
const router = Router();
router.post("/", authMiddleware, roleMiddleware("client"), createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", authMiddleware, roleMiddleware("client"), updateProject);
router.delete("/:id", authMiddleware, roleMiddleware("client"), deleteProject);
router.post(
  "/:id/save",
  authMiddleware,
  roleMiddleware("freelancer"),
  saveProject,
);
export default router;
