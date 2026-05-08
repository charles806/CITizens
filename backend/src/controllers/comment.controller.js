import { getAuth } from "@clerk/express";
import Comment from "../models/comment.model.js";
import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import notificationModel from "../models/notification.model.js";

// GET COMMENTS
export const getComment = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("user", "username firstName lastName profilePic");

    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

// CREATE COMMENT
export const createComment = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const user = await User.findOne({ clerkId: userId });
    const post = await Post.findById(postId);

    if (!user || !post) {
      return res.status(404).json({
        message: "User or post not found",
      });
    }

    const comment = await Comment.create({
      user: user._id,
      post: postId,
      content,
    });

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    // create notification if not post owner
    if (post.user.toString() !== user._id.toString()) {
      await notificationModel.create({
        from: user._id,
        to: post.user,
        type: "comment",
        post: postId,
        comment: comment._id,
      });
    }

    res.status(201).json({ comment });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create comment",
      error: error.message,
    });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { commentId } = req.params;

    const user = await User.findOne({ clerkId: userId });
    const comment = await Comment.findById(commentId);

    if (!user || !comment) {
      return res.status(404).json({
        error: "User or comment not found",
      });
    }

    // authorization check
    if (comment.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: "You can only delete your own comments",
      });
    }

    // remove comment from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
    });

    // delete comment
    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};
