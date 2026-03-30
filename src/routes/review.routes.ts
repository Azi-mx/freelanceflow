import { Router } from "express";
import {
  createReview,
  getReviewsByClient,
  getReviewsByFreelancer,
  getReviewsByProject,
} from "../controllers/reviewController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/:contractId", authMiddleware, createReview);
router.get("/freelancer/:freelancerId", getReviewsByFreelancer);
router.get("/project/:projectId", getReviewsByProject);
router.get("/client/:clientId", getReviewsByClient);

export default router;
