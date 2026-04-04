import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db.js";
import foodRouter from "./routers/foodRouter.js";
import userRouter from "./routers/userRoute.js";
import orderRouter from "./routers/orderRouter.js";
import statsRouter from "./routers/statsRoute.js";
import paymentRouter from "./routers/paymentRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import reviewRouter from "./routers/reviewRouter.js";
import promoRouter from "./routers/promoRouter.js";
import { securityHeaders, apiLimiter, authLimiter, validateInput } from "./middleware/security.js";
import 'dotenv/config'

// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json({ limit: '10mb' }));
// Dynamic CORS for all lhr.life domains
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Allow all localhost origins (any port)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow all lhr.life domains
    if (origin.includes('.lhr.life')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));

// Security middleware
app.use(securityHeaders);
app.use(validateInput);
// Rate limiting: login/register dùng authLimiter, còn lại dùng apiLimiter
app.use("/api/", (req, res, next) => {
  if (req.path === "/user/login" || req.path === "/user/register") {
    return authLimiter(req, res, next);
  }
  return apiLimiter(req, res, next);
});

// Add headers to allow HTTPS to HTTP connections
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Private-Network', 'true');
  next();
});

// database connection
connectDB();

// Store SSE connections
const sseConnections = new Set();

// SSE endpoint for real-time order updates
app.get('/api/orders/subscribe', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const clientId = Date.now() + Math.random();
  sseConnections.add({ id: clientId, res });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  // Remove connection on client disconnect
  req.on('close', () => {
    sseConnections.forEach(conn => {
      if (conn.id === clientId) {
        sseConnections.delete(conn);
      }
    });
  });
});

// Helper function to broadcast updates
const broadcastOrderUpdate = (orderId, status, userId) => {
  const message = JSON.stringify({
    type: 'order_update',
    orderId,
    status,
    userId,
    timestamp: new Date().toISOString()
  });

  sseConnections.forEach(conn => {
    try {
      conn.res.write(`data: ${message}\n\n`);
    } catch (error) {
      // Remove dead connections
      sseConnections.delete(conn);
    }
  });
};

// Make broadcast function available globally
global.broadcastOrderUpdate = broadcastOrderUpdate;

// api endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);
app.use("/api/stats", statsRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/category", categoryRouter);
app.use("/api/review", reviewRouter);
app.use("/api/promo", promoRouter);
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static("uploads"));

// Serve frontend static files
app.use(express.static("../admin/dist"));

// Custom SPA fallback middleware
app.use((req, res, next) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/images') || req.path.includes('.')) {
    return next();
  }

  // For all other routes, serve index.html
  res.sendFile(path.resolve("../admin/dist/index.html"));
});

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
