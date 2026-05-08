import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import notificationModel from "../models/notification.model.js";

export const getNotification = async (req, res) => {
  const { userId } = getAuth(req);

  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(404).json({ message: "User not found" });

  const notification = await notificationModel
    .find({ to: user._id })
    .sort({ createdAt: -1 })
    .populate("post", "content image")
    .populate("comment", "content");

  res.status(200).json({ notification });
};

export const deleteNotification = async (req, res) => {
  const { userId } = getAuth(req);
  const { notificationId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  if (!user) return res.status(404).json({ error: "User not found" });

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    to: user._id,
  });

  if (!notification)
    return res.status(404).json({ error: "Notification not found" });

  res.status(200).json({ message: "Notification deleted successfully" });
};
