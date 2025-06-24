import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routes/userRouter.js";
import jobRouter from "./routes/jobRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import chatRouter from "./routes/chatRouter.js";
import aiChatRouter from "./routes/aiChatRouter.js";
import { ChatMessage } from "./models/chatMessageSchema.js";
import dotenv from "dotenv";
dotenv.config();


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://job-temp-amg9-bzje1tu3c-dev-parmars-projects.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ["https://job-temp-amg9-bzje1tu3c-dev-parmars-projects.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dbConnection();

app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/aichat", aiChatRouter);

app.use(errorMiddleware);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on("sendMessage", async (data) => {
    const { room, sender, receiver, message } = data;
    const newMessage = new ChatMessage({
        application: room,
        sender,
        receiver,
        message
    });
    await newMessage.save();
    io.to(room).emit("receiveMessage", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
}); 