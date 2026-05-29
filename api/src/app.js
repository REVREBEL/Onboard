import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// all your existing imports/routes from server.js

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined"));

// all your existing routes here:
// app.get("/api/surveys", ...)
// app.post("/api/onboarding", ...)
// etc.

export default app;
