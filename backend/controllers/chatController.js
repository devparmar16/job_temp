import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { ChatMessage } from "../models/chatMessageSchema.js";
import ErrorHandler from "../middlewares/error.js";

export const getChatMessages = catchAsyncErrors(async (req, res, next) => {
    const { applicationId } = req.params;
    const messages = await ChatMessage.find({ application: applicationId }).sort({ createdAt: 1 }).populate('sender');
    res.status(200).json({
        success: true,
        messages,
    });
}); 