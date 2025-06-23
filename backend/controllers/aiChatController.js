import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateChatReply = catchAsyncErrors(async (req, res, next) => {
    if (!process.env.GEMINI_API_KEY) {
        return next(new ErrorHandler("GEMINI_API_KEY is not defined. Please check your environment variables.", 500));
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const { message } = req.body;
    if (!message) {
        return next(new ErrorHandler("No message provided.", 400));
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    res.status(200).json({
        success: true,
        reply: text,
    });
}); 