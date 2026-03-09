import { Router } from "express";
import {
  getProfile,
  updateClientProfile,
  updateFreelancerProfile,
} from "../controllers/profileController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
const router = Router();

router.put(
  "/freelancer",
  authMiddleware,
  roleMiddleware("freelancer"),
  updateFreelancerProfile,
);
router.put(
  "/client",
  authMiddleware,
  roleMiddleware("client"),
  updateClientProfile,
);
router.get("/me", authMiddleware, getProfile);
export default router;
