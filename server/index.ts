import express from "express";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import dotenv from "dotenv";
import { supabase } from "./services/supabase";

// Routes
import lotteryRoutes from "./routes/lottery";
import adminRoutes from "./routes/admin";

// Middleware
import { errorHandler } from "./middleware/error";

dotenv.config();

const app = express();
const PORT = 3000;

// Trust proxy for express-rate-limit to work correctly behind nginx
app.set('trust proxy', 1);

// Security & Logging
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Vite development
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for debugging
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { 
    xForwardedForHeader: false,
    forwardedHeader: false 
  }, // Already handled by Express trust proxy
});
app.use("/api", limiter);

// --- Monitoring Endpoint ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// --- API Routes ---
app.use("/api/admin", adminRoutes);
app.use("/api", lotteryRoutes);

// Catch-all for undefined API routes to return JSON instead of HTML
app.use("/api", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
});

// --- Error Handling ---
app.use(errorHandler);

// --- Vite / Static Files ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Thai Lottery Checker running on http://localhost:${PORT}`);
  });
}

startServer();
