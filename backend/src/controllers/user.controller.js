import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { clerkClient, getAuth } from "@clerk/express";

/**
 * @desc Get a user's public profile
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Validate username
    if (!username?.trim()) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    // Find user
    const user = await User.findOne({ username }).select("-email -__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id });

    // Counts from arrays
    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    return res.status(200).json({
      message: "User profile retrieved successfully",
      user,
      posts,
      postsCount: posts.length,
      followersCount,
      followingCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update current logged-in user's profile
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    // Only allow specific fields to be updated (security)
    const allowedFields = [
      "firstName",
      "lastName",
      "bio",
      "location",
      "profilePic",
      "bannerImg",
      "username",
    ];

    const updates = {};

    // Filter only allowed fields
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    
    if (updates.username) {
      const existing = await User.findOne({ username: updates.username });
      if (existing && existing.clerkId !== userId) {
        return res.status(400).json({
          message: "Username already taken",
        });
      }
    }

    // Update user
    const user = await User.findOneAndUpdate({ clerkId: userId }, updates, {
      new: true,
    }).select("-email -__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Sync Clerk user to MongoDB (create if not exists)
 * @route POST /api/users/sync
 */
export const syncUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: userId });

    if (existingUser) {
      return res.status(200).json({
        user: existingUser,
        message: "User already exists",
      });
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    const newUser = {
      clerkId: userId,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      username: clerkUser.username || "",
      profilePic: clerkUser.imageUrl || "",
    };

    const createdUser = await User.create(newUser);

    return res.status(201).json({
      user: createdUser,
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get currently logged-in user
 * @route GET /api/users/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    const user = await User.findOne({ clerkId: userId }).select("-email -__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Follow or unfollow a user
 * @route POST /api/users/follow/:targetUserId
 */
export const followUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({
        message: "You can't follow yourself",
      });
    }

    const currentUser = await User.findOne({ clerkId: userId });
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // UNFOLLOW
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: targetUserId },
      });

      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUser._id },
      });
    } else {
      // FOLLOW
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { following: targetUserId },
      });

      await User.findByIdAndUpdate(targetUserId, {
        $push: { followers: currentUser._id },
      });

      // Create notification only on follow
      await Notification.create({
        from: currentUser._id,
        to: targetUserId,
        type: "follow",
      });
    }

    return res.status(200).json({
      message: isFollowing
        ? "User unfollowed successfully"
        : "User followed successfully",
    });
  } catch (error) {
    next(error);
  }
};
