import express from "express";

import type {
  Request,
  Response,
  NextFunction,
} from "express";

import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import multer from "multer";
import path from "path";

import prisma
  from "./config/prisma.js";

import {
  getCorsOrigins,
  validateEnvironment,
} from "./config/env.js";

import authRoutes
  from "./routes/auth.routes.js";

import employeeRoutes
  from "./routes/employee.routes.js";

import shiftRoutes
  from "./routes/shift.routes.js";

import scheduleRoutes
  from "./routes/schedule.routes.js";

import attendanceRoutes
  from "./routes/attendance.routes.js";

import requestRoutes
  from "./routes/request.routes.js";

import notificationRoutes
  from "./routes/notification.routes.js";

import payslipRoutes
  from "./routes/payslip.routes.js";

import profileRoutes
  from "./routes/profile.routes.js";

import dashboardRoutes
  from "./routes/dashboard.routes.js";

import announcementRoutes
  from "./routes/announcement.routes.js";

import companyRoutes
  from "./routes/company.routes.js";

import departmentRoutes
  from "./routes/department.routes.js";

import officeRoutes
  from "./routes/office.routes.js";

import rbacRoutes
  from "./routes/rbac.routes.js";

import settingRoutes
  from "./routes/setting.routes.js";

import auditLogRoutes
  from "./routes/audit-log.routes.js";

dotenv.config();

/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/

validateEnvironment();

/*
|--------------------------------------------------------------------------
| App
|--------------------------------------------------------------------------
*/

const app =
  express();

const PORT =
  process.env.PORT ||
  5000;

const corsOrigins =
  getCorsOrigins();

/*
|--------------------------------------------------------------------------
| Proxy
|--------------------------------------------------------------------------
*/

if (
  process.env.TRUST_PROXY ===
  "1"
) {
  app.set(
    "trust proxy",
    1
  );
}

/*
|--------------------------------------------------------------------------
| Security headers
|--------------------------------------------------------------------------
*/

app.disable(
  "x-powered-by"
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy:
        "cross-origin",
    },
  })
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin(
      origin,
      callback
    ) {
      /*
      |--------------------------------------------------------------------------
      | Requests tanpa Origin
      |--------------------------------------------------------------------------
      |
      | Dibutuhkan native mobile app/Postman/server-to-server.
      |
      */

      if (!origin) {
        callback(
          null,
          true
        );

        return;
      }

      if (
        corsOrigins.includes(
          origin
        )
      ) {
        callback(
          null,
          true
        );

        return;
      }

      callback(
        new Error(
          "CORS_NOT_ALLOWED"
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: false,
  })
);

/*
|--------------------------------------------------------------------------
| Request parsing
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "1mb",
  })
);

/*
|--------------------------------------------------------------------------
| Static uploads
|--------------------------------------------------------------------------
*/

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/employees",
  employeeRoutes
);

app.use(
  "/api/shifts",
  shiftRoutes
);

app.use(
  "/api/schedules",
  scheduleRoutes
);

app.use(
  "/api/attendances",
  attendanceRoutes
);

app.use(
  "/api/requests",
  requestRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/payslips",
  payslipRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/announcements",
  announcementRoutes
);

app.use(
  "/api/companies",
  companyRoutes
);

app.use(
  "/api/departments",
  departmentRoutes
);

app.use(
  "/api/offices",
  officeRoutes
);

app.use(
  "/api/rbac",
  rbacRoutes
);

app.use(
  "/api/settings",
  settingRoutes
);

app.use(
  "/api/audit-logs",
  auditLogRoutes
);

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

app.get(
  "/api/health",
  (
    req,
    res
  ) => {
    return res
      .status(200)
      .json({
        success: true,

        message:
          "SynTime API is running",
      });
  }
);

app.get(
  "/api/health/db",
  async (
    req,
    res
  ) => {
    try {
      await prisma
        .$queryRaw`SELECT 1`;

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Database connection is healthy",
        });
    } catch (error) {
      console.error(
        "Database health check failed:",
        error
      );

      return res
        .status(503)
        .json({
          success: false,

          message:
            "Database connection failed",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Multer errors
|--------------------------------------------------------------------------
*/

app.use(
  (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Attachment file must not exceed 5 MB",
          });
      }

      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message,
        });
    }

    if (
      error instanceof Error &&
      error.message ===
        "Only PDF, JPG, JPEG, and PNG files are allowed"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message,
        });
    }

    next(error);
  }
);

/*
|--------------------------------------------------------------------------
| CORS errors
|--------------------------------------------------------------------------
*/

app.use(
  (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      error instanceof Error &&
      error.message ===
        "CORS_NOT_ALLOWED"
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "Origin is not allowed",
        });
    }

    next(error);
  }
);

/*
|--------------------------------------------------------------------------
| Payload errors
|--------------------------------------------------------------------------
*/

app.use(
  (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      error instanceof
        SyntaxError &&
      "body" in error
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid JSON request body",
        });
    }

    next(error);
  }
);

/*
|--------------------------------------------------------------------------
| Final error handler
|--------------------------------------------------------------------------
*/

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

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Internal server error",
      });
  }
);

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

app.listen(
  PORT,
  () => {
    console.log(
      `SynTime API running on port ${PORT}`
    );
  }
);