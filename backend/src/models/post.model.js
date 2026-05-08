import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      maxlength: 280,
      default: "",
    },

    media: [
      {
        type: String,
      },
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reposts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    hashtags: [
      {
        type: String,
      },
    ],

    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;
