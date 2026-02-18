import { Router } from "express";
import os from "os";

const router = Router();

router.get("/basic", (req, res) => {
  res.json({
    message: "Server is running",
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    timestamp: new Date().toISOString,
  });
});

// @desc    Comprehensive server status check
// @route   GET /api/health
// @access  Public

router.get("/health", (req, res) => {
  const environment = process.env.NODE_ENV || "development";
  const startTime = process.hrtime();

  // calculate hrTime
  const hrTime = process.hrtime(startTime);
  const responseTime = (hrTime[0] * 1000 + hrTime[1] / 1000000).toFixed(2);

  res.status(200).json({
    success: true,
    message: `Server is running in ${environment} mode`,
    environment: environment,
    isProduction: environment === "PRODUCTION",
    isDevelopment: environment === "DEVELOPMENT",
    isTest: environment === "test",

    server: {
      status: "active",
      port: process.env.PORT || 5000,
      hostname: os.hostname(),
      platform: os.platform(),
      uptime: `${Math.floor(process.uptime() / 60)} minutes ${Math.floor(process.uptime() % 60)} seconds`,
      responseTime: `${responseTime}ms`,
      currentTime: new Date().toISOString(),
    },
    system: {
      cpus: os.cpus().length,
      memory: {
        total: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        free: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usage: `${((1 - os.freemem() / os.totalmem()) * 100).toFixed(2)}%`,
      },
      loadAverage: os.loadavg(),
      networkInterfaces: Object.keys(os.networkInterfaces()).length,
    },
    application: {
      nodeVersion: process.version,
      pid: process.pid,
      title: process.title,
      memoryUsage: {
        rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(process.memoryUsage().external / 1024 / 1024).toFixed(2)} MB`,
      },
    },
    api: {
      version: "1.0.0",
      endpoints: [
        { 
            path: "/health", 
            methods: ["GET"], 
            description: "Health check" },
        // {
        //   path: "/db",
        //   methods: ["GET"],
        //   description: "Database status",
        // },
        // {
        //   path: "/env",
        //   methods: ["GET"],
        //   description: "Environment info",
        // },
      ],
    },
  });
});

export default router;
