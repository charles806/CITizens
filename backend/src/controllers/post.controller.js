import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";
import { userRoute } from "../routes/user.route.js";

// GET ALL POSTS
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "username firstName lastName profilePic")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username firstName lastName profilePic",
        },
      });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

// GET SINGLE POST
export const getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("author", "username firstName lastName profilePic")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username firstName lastName profilePic",
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("GET POST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch post",
    });
  }
};

// GET USER POSTS
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "username firstName lastName profilePic")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username firstName lastName profilePic",
        },
      });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("GET USER POSTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user posts",
    });
  }
};

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { content } = req.body;
    const imageFile = req.file;

    if (!content && !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Post must contain either text or image",
      });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let mediaUrls = [];

    // Upload image if provided
    if (imageFile) {
      try {
        const base64Image = `data:${
          imageFile.mimetype
        };base64,${imageFile.buffer.toString("base64")}`;

        const uploadResponse = await cloudinary.uploader.upload(base64Image, {
          folder: "social_media_posts",
          resource_type: "image",
          transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" },
            { format: "auto" },
          ],
        });

        mediaUrls.push(uploadResponse.secure_url);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);

        return res.status(400).json({
          success: false,
          message: "Failed to upload image",
        });
      }
    }

    const post = await Post.create({
      author: user._id,
      content: content || "",
      media: mediaUrls,
    });

    return res.status(201).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
};

// LIKE / UNLIKE POST
export const likePost = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { postId } = req.params;

    const user = await User.findOne({ clerkId: userId });
    const post = await Post.findById(postId);

    if (!user || !post) {
      return res.status(404).json({
        success: false,
        message: "User or Post not found",
      });
    }

    const isLiked = post.likes.includes(user._id);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: user._id },
      });
    } else {
      // Like
      await Post.findByIdAndUpdate(postId, {
        $push: { likes: user._id },
      });

      // Notify post owner if not liking own post
      if (post.author.toString() !== user._id.toString()) {
        await Notification.create({
          from: user._id,
          to: post.author,
          type: "like",
          post: postId,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: isLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
    });
  } catch (error) {
    console.error("LIKE POST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to like/unlike post",
    });
  }
};

export const deletePost = async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post) {
    return res.status(404).json({ error: "User or post not found" });
  }

  if (post.user.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ error: "You can only delete your own posts" });
  }

  await Comment.deleteMany({ post: postId });
  await Post.findByIdAndDelete(postId);

  res.status(200).json({ message: "Post deleted successfully" });
};
