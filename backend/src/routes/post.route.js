import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getUserPosts,
  likePost,
} from "../controllers/post.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

export const postRoutes = express.Router();

postRoutes.get("/", getPosts);
postRoutes.get("/:postId", getPost);
postRoutes.get("/user/:username", getUserPosts);

//Protected routes
postRoutes.post("/", protectedRoute, upload.single("image", createPost));
postRoutes.post("/:postId/like", protectedRoute, likePost);
postRoutes.delete("/:postId", protectedRoute, deletePost);
