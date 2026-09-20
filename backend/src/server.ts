import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import api from "./routes/api";
import { errorHandler } from "./middleware/error";

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use("/api", api);
app.use(errorHandler);

app.listen(port, () => console.log(`Neltrix API running on http://localhost:${port}`));
