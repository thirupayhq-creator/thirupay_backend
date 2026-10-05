import { Router } from "express";
import * as payoutController from "./payout.controller";
import { authenticate } from "../../core/middleware/auth.middleware";
import { validateBody } from "../../core/middleware/validation.middleware";
import { createPayoutSchema } from "./payout.schema";

const router = Router();

router.post(
  "/",
  authenticate,
  validateBody(createPayoutSchema),
  payoutController.create
);

router.get("/", authenticate, payoutController.listPayouts);
router.get("/:id", authenticate, payoutController.getPayout);

export default router;
