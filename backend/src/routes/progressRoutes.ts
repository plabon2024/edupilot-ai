import express from "express";
import { getDashboard } from "./../controllers/progressController";

import protect from "../middleware/auth";

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboard);

export const progressRoutes = router;
