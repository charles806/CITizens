import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
  deleteNotification,
  getNotification,
} from "../controllers/notification.controller.js";

const routes = express.Router();

routes.get("/", protectedRoute, getNotification);
routes.delete("/:notification", protectedRoute, deleteNotification);

export const notificationRoutes = routes;
