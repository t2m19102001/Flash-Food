import express from "express";
import { validatePromo, addPromo, listPromos, removePromo } from "../controllers/promoController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const promoRouter = express.Router();

// Public route (cần đăng nhập)
promoRouter.post("/validate", authMiddleware, validatePromo);

// Admin routes
promoRouter.post("/add", adminMiddleware, addPromo);
promoRouter.get("/list", adminMiddleware, listPromos);
promoRouter.post("/remove", adminMiddleware, removePromo);

export default promoRouter;
