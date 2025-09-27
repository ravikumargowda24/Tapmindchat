import { Router } from "express";
import { getMessages, uploadFile, forwardMessage, deleteMessage } from "../controllers/MessagesController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";
const messagesRoutes = Router();
const upload = multer({ dest: "uploads/files/" });
messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post(
  "/upload-file",
  verifyToken,
  upload.single("file"),
  uploadFile
);

messagesRoutes.post("/forward-message", verifyToken, forwardMessage);

messagesRoutes.delete("/delete-message", verifyToken, deleteMessage);
export default messagesRoutes;
