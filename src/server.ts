import "dotenv/config";
import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import uploadRouter from "./routes/upload.routes.js";
import swaggerSpec from "./docs/swagger.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map(origin => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  })
);

app.use("/", express.static(path.join(process.cwd(), "public")));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use("/api", uploadRouter);

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 Swagger docs available at http://localhost:${PORT}/docs`);
});
