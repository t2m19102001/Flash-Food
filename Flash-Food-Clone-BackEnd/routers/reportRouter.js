import express from "express";
import { 
    getOrderReport, 
    getRevenueReport, 
    getProductReport, 
    getUserReport 
} from "../controllers/reportController.js";
import { authMiddleware } from "../middleware/auth.js";

const reportRouter = express.Router();

reportRouter.get("/orders", authMiddleware, getOrderReport);
reportRouter.get("/revenue", authMiddleware, getRevenueReport);
reportRouter.get("/products", authMiddleware, getProductReport);
reportRouter.get("/users", authMiddleware, getUserReport);

export default reportRouter;