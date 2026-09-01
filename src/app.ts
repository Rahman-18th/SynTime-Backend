import express from "express";
import type {
  Request,
  Response,
  NextFunction,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import prisma from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import shiftRoutes from "./routes/shift.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import requestRoutes from "./routes/request.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import path from "path";
import payslipRoutes from "./routes/payslip.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payslips", payslipRoutes);
app.use(
  "/api/profile",
  profileRoutes
);
app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SynTime API is running",
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connection is healthy",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use(
  (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message:
            "Attachment file must not exceed 5 MB",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Only PDF, JPG, JPEG, and PNG files are allowed"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
);

app.use(
  (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error(
      "Unhandled error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  console.log(`SynTime API running on port ${PORT}`);
});