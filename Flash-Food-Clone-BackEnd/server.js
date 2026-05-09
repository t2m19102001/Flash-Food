import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { connectDB } from "./config/db.js";
import foodRouter from "./routers/foodRouter.js";
import userRouter from "./routers/userRoute.js";
import orderRouter from "./routers/orderRouter.js";
import statsRouter from "./routers/statsRoute.js";
// import paymentRouter from "./routers/paymentRouter.js"; // TẮT STRIPE
import categoryRouter from "./routers/categoryRouter.js";
import reviewRouter from "./routers/reviewRouter.js";
import promoRouter from "./routers/promoRouter.js";
import { securityHeaders, apiLimiter, authLimiter, validateInput } from "./middleware/security.js";
import { authMiddleware } from "./middleware/auth.js";
import contactRouter from "./routers/contactRouter.js";
import cookieParser from 'cookie-parser';
import adminRouter from "./routers/adminRouter.js";
import bannerRouter from "./routers/bannerRouter.js";
import reportRouter from "./routers/reportRouter.js";
import notificationRouter from "./routers/notificationRouter.js";
import paymentRouter from './routers/paymentRouter.js';
import 'dotenv/config';

// Lấy đường dẫn thư mục hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔥 THÊM COOKIE PARSER (QUAN TRỌNG CHO AUTH)
app.use(cookieParser());

// CORS - Cho phép gửi cookie và credentials
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Cho phép localhost (các port khác nhau)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Cho phép các domain .lhr.life (ngrok)
    if (origin.includes('.lhr.life')) {
      return callback(null, true);
    }
    
    // Cho phép .ngrok.io
    if (origin.includes('.ngrok.io')) {
      return callback(null, true);
    }
    
    // Cho phép Vite dev server (5173, 5174, 5175...)
    if (origin.match(/^http:\/\/localhost:517[0-9]$/)) {
      return callback(null, true);
    }

    // Cho phép production server
    if (origin === 'http://112.197.123.59' || origin === 'http://112.197.123.59:4000') {
      return callback(null, true);
    }

    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Security middleware
app.use(securityHeaders);
app.use(validateInput);

// Rate limiting
app.use("/api/", (req, res, next) => {
  if (req.path === "/user/login" || req.path === "/user/register") {
    return authLimiter(req, res, next);
  }
  return apiLimiter(req, res, next);
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});

// database connection
connectDB();

// ========== SSE CONNECTIONS ==========
const sseConnections = new Map();

const broadcastOrderUpdateToUser = (userId, orderId, status) => {
  const message = JSON.stringify({
    type: 'order_update',
    orderId,
    status,
    timestamp: new Date().toISOString()
  });

  const userConnections = sseConnections.get(userId);
  if (userConnections) {
    userConnections.forEach(conn => {
      try {
        conn.res.write(`data: ${message}\n\n`);
      } catch (error) {
        userConnections.delete(conn);
      }
    });
    if (userConnections.size === 0) {
      sseConnections.delete(userId);
    }
  }
};

app.get('/api/orders/subscribe', authMiddleware, (req, res) => {
  const userId = req.userId;
  
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const connectionId = Date.now() + Math.random();
  const connection = { id: connectionId, res, userId };
  
  if (!sseConnections.has(userId)) {
    sseConnections.set(userId, new Set());
  }
  sseConnections.get(userId).add(connection);

  res.write(`data: ${JSON.stringify({ type: 'connected', userId, connectionId })}\n\n`);

  req.on('close', () => {
    const userConnections = sseConnections.get(userId);
    if (userConnections) {
      userConnections.delete(connection);
      if (userConnections.size === 0) {
        sseConnections.delete(userId);
      }
    }
  });
});

const broadcastOrderUpdate = (orderId, status, userId) => {
  broadcastOrderUpdateToUser(userId, orderId, status);
};

global.broadcastOrderUpdate = broadcastOrderUpdate;

// ========== STATIC FILES ==========
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
const imagesDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 🔥 PHỤC VỤ FILE TĨNH - QUAN TRỌNG CHO ẢNH
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'uploads/images')));

// ========== API ENDPOINTS ==========
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);
app.use("/api/stats", statsRouter);
app.use("/api/contact", contactRouter);
app.use("/api/category", categoryRouter);
app.use("/api/review", reviewRouter);
app.use("/api/promo", promoRouter);
app.use("/api/admin", adminRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/report", reportRouter);
app.use("/api/notifications", notificationRouter);
app.use('/api/payment', paymentRouter);


// ========== SERVE FRONTEND ==========
const adminDistPath = path.join(__dirname, "../admin/dist");

if (fs.existsSync(adminDistPath)) {
  app.use(express.static(adminDistPath));
  
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || 
        req.path.startsWith('/uploads') || 
        req.path.startsWith('/images') || 
        req.path.includes('.')) {
      return next();
    }
    res.sendFile(path.resolve(adminDistPath, "index.html"));
  });
} else {
  console.log("⚠️ Admin dist folder not found at:", adminDistPath);
}

app.get("/", (req, res) => {
  res.send("API Working");
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Lỗi server nội bộ!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========== START SERVER ==========
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🖼️ Images directory: ${imagesDir}`);
  console.log(`🍪 Cookie parser enabled`);
  console.log(`✅ MoMo payment is ACTIVE`);
  console.log(`❌ Stripe payment is DISABLED`);
});