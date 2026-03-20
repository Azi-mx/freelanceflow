import { Router } from "express";
import {
  getProfile,
  updateClientProfile,
  updateFreelancerProfile,
} from "../controllers/profileController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { UserRole } from "../types/enum.js";
import { validate } from "../middlewares/validate.js";
import {
  updateClientSchema,
  updateFreelancerSchema,
} from "../validations/profile.validation.js";
const router = Router();

router.put(
  "/freelancer",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  validate(updateFreelancerSchema),
  updateFreelancerProfile,
);
router.put(
  "/client",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  validate(updateClientSchema),
  updateClientProfile,
);
router.get("/me", authMiddleware, getProfile);
export default router;
