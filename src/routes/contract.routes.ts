import { Router } from "express";
import {
  completeContract,
  getClientContracts,
  getContract,
  getFreelancerContracts,
  terminateContract,
} from "../controllers/contractController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { UserRole } from "../types/enum.js";
const router = Router();

router.get(
  "/my",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  getClientContracts,
);
router.get(
  "/my/freelancer",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  getFreelancerContracts,
);
router.get("/:contractId", authMiddleware, getContract);

router.post("/:contractId/terminate", authMiddleware, terminateContract);
router.post(
  "/:contractId/complete",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  completeContract,
);
export default router;
