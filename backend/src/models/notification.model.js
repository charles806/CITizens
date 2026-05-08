import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["like", "comment", "follow"],
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null,
    }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);