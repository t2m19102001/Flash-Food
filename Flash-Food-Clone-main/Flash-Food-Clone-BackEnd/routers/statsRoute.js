import express from "express";
import { getStatistics } from "../controllers/statsController.js";
import { adminMiddleware } from "../middleware/auth.js";

const statsRouter = express.Router();

statsRouter.get("/", adminMiddleware, getStatistics);

export default statsRouter;
