import express from "express";
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  syncUser,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

export const userRoute = express.Router();

userRoute.get("/profile/:username", getUserProfile);
userRoute.put("/profile", protectedRoute, updateUserProfile);
userRoute.post("/sync", protectedRoute, syncUser);
userRoute.post("/me", protectedRoute, getCurrentUser);
userRoute.post("/follow/:targetUserId", protectedRoute, followUser);
