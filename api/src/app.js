import "dotenv/config";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { google } from "googleapis";
import { pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const surveyModulesDir = path.resolve(__dirname, "../survey_modules");

const MODULE_FILES = {
  revenue: "revenue.json",
  distribution: "distribution.json",
  digital: "digital.json",
  social: "social.json"
};

const ALWAYS_INCLUDE_SCOPES = new Set(["all", "default"]);

const PMS_INSTRUCTION = {
  opera: "Opera-specific setup note: include your active Opera interfaces and daily export workflow details.",
  stayntouch: "StayNTouch-specific setup note: include active integrations and PMS permission roles used by your team."
};

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 20 } });

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));

const onboardingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/onboarding", onboardingLimiter);

const defaultGoogleDriveFolderId = process.env.DEFAULT_GOOGLE_DRIVE_FOLDER_ID || "";
