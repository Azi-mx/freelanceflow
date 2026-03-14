import { Router } from "express";
import {
  getProfile,
  updateClientProfile,
  updateFreelancerProfile,
} from "../controllers/profileController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { UserRole } from "../types/enum.js";
const router = Router();

router.put(
  "/freelancer",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  updateFreelancerProfile,
);
router.put(
  "/client",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  updateClientProfile,
);
router.get("/me", authMiddleware, getProfile);
export default router;
