import Router from "express";
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

router.get("/contracts/:contractId", authMiddleware, getContract);
router.get(
  "/contract/:clientId",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  getClientContracts,
);
router.get(
  "/contract/:freelancerId",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  getFreelancerContracts,
);
router.put(
  "/:contractId/terminate",
  authMiddleware,
  roleMiddleware(UserRole.CLIENT),
  terminateContract,
);
router.post(
  "/:contractId/completeContract",
  authMiddleware,
  roleMiddleware(UserRole.FREELANCER),
  completeContract,
);
export default router;
