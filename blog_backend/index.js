import express from "express";
import cors from "cors";

import postRoutes from "./routes/posts.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}!`));
