import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { errorMiddleware } from "./src/middleware/error.middleware.js";
import { userRoute } from "./src/routes/user.route.js";
import { postRoutes } from "./src/routes/post.route.js";
import commentRoutes from "./src/routes/comment.route.js";
import { notificationRoutes } from "./src/routes/notification.route.js";
import { arcjetMiddleware } from "./src/middleware/arcjet.middleware.js";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT;

//Built In Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use(arcjetMiddleware);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the CITizens API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoute);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notification", notificationRoutes);

//Error Middleware
app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server", error.message);
    process.exit(1);
  }
};

startServer();
