import "dotenv/config";
import express from "express";
import cors from "cors";
import { initDb } from "./db/init.js";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import userRoutes from "./routes/users.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Kino platform API ${PORT}-portda ishga tushdi`);
    });
  })
  .catch((err) => {
    console.error("Baza ulanishida xatolik:", err);
    process.exit(1);
  });
