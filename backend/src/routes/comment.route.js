import express from "express";
import { createComment, deleteComment, getComment } from "../controllers/comment.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const commentRoutes = express.Router();

commentRoutes.get('/post/:postId', getComment)
commentRoutes.post('/post/:postId', protectedRoute, createComment)
commentRoutes.delete("/:commentId", protectedRoute, deleteComment)

export default commentRoutes; 