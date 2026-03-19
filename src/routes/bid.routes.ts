import { Router } from "express";
import {
  acceptBid,
  createBid,
  getBidsByFreelancer,
  getBidsByProject,
  rejectBid,
  updateBid,
  withdrawBid,
} from "../controllers/bidController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { UserRole } from "../types/enum.js";

const router = Router();

router.get(
  "/my",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  getBidsByFreelancer,
);
router.post(
  "/:bidId/accept",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  acceptBid,
);
router.post(
  "/:bidId/reject",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  rejectBid,
);
router.post(
  "/:bidId/withdraw",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  withdrawBid,
);
router.put(
  "/:bidId",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  updateBid,
);
router.post(
  "/:projectId/createBid",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  createBid,
);
router.get(
  "/project/:projectId",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  getBidsByProject,
);
export default router;
