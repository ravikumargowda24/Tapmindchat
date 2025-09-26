import { Server as SocketIOServer } from "socket.io";
import Message from "./model/MessagesModel.js";
import Channel from "./model/ChannelModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map(); // ✅ Move before usage

  const deleteMessageSocket = async (data) => {
    const { messageId, channelId } = data;

    if (channelId) {
      const channel = await Channel.findById(channelId).populate("members");
      if (channel) {
        // Broadcast to channel room
        io.to(`channel_${channelId}`).emit("message-deleted", { messageId, channelId });
      }
    } else {
      const message = await Message.findById(messageId);
      if (message) {
        // Broadcast to sender and recipient rooms
        io.to(`user_${message.sender}`).emit("message-deleted", { messageId });
        io.to(`user_${message.recipient}`).emit("message-deleted", { messageId });
      }
    }
  };

  // Add these console.logs to your deleteMessageSocket function:

  // const deleteMessageSocket = async (data) => {
  //   const { messageId, channelId, userId } = data;

  //   console.log("Delete request received:", { messageId, channelId, userId }); // Debug

  //   try {
  //     const message = await Message.findById(messageId);
  //     if (!message) {
  //       console.log("Message not found:", messageId); // Debug
  //       return;
  //     }

  //     console.log("Found message:", message); // Debug

  //     // Permission check — sender or channel admin
  //     if (message.sender.toString() !== userId) {
  //       if (message.recipient) {
  //         console.log("Permission denied: not sender of personal message"); // Debug
  //         return;
  //       }
  //       const channel = await Channel.findOne({ messages: messageId });
  //       if (!channel || channel.admin.toString() !== userId) {
  //         console.log("Permission denied: not channel admin"); // Debug
  //         return;
  //       }
  //     }

  //     // Delete from DB
  //     const deletedMessage = await Message.findByIdAndDelete(messageId);
  //     console.log("Message deleted from DB:", deletedMessage ? "success" : "failed"); // Debug

  //     // Remove from channel if applicable
  //     if (!message.recipient) {
  //       const channelUpdate = await Channel.findOneAndUpdate(
  //         { messages: messageId },
  //         { $pull: { messages: messageId } }
  //       );
  //       console.log("Channel updated:", channelUpdate ? "success" : "failed"); // Debug
  //     }

  //     // Emit deletion event to all relevant clients
  //     const emitData = { messageId };
  //     if (channelId) {
  //       console.log(`Emitting to channel_${channelId}:`, emitData); // Debug
  //       io.to(`channel_${channelId}`).emit("message-deleted", emitData);
  //     } else {
  //       console.log(`Emitting to users:`, {
  //         sender: message.sender,
  //         recipient: message.recipient
  //       }); // Debug
  //       io.to(`user_${message.recipient}`).emit("message-deleted", emitData);
  //       io.to(`user_${message.sender}`).emit("message-deleted", emitData);


  //     }
  //   } catch (err) {
  //     console.error("Delete message error:", err);
  //   }
  // };
  const addChannelNotify = async (channel) => {
    if (channel && channel.members) {
      channel.members.forEach((member) => {
        io.to(`user_${member.toString()}`).emit("new-channel-added", channel);
      });
    }
  };

  const sendMessage = async (message) => {
    const createdMessage = await Message.create(message);
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color")
      .exec();

    io.to(`user_${message.recipient}`).emit("receiveMessage", messageData);
    io.to(`user_${message.sender}`).emit("receiveMessage", messageData);
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,
    });

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });

    const finalData = { ...messageData._doc, channelId };
    io.to(`channel_${channelId}`).emit("receive-channel-message", finalData);
  };

  const disconnect = (socket) => {
    console.log("Client disconnected", socket.id);
    for (const [userId, socketIds] of userSocketMap.entries()) {
      if (socketIds.includes(socket.id)) {
        const updatedSockets = socketIds.filter((id) => id !== socket.id);
        if (updatedSockets.length) userSocketMap.set(userId, updatedSockets);
        else userSocketMap.delete(userId);
        break;
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      if (!userSocketMap.has(userId)) userSocketMap.set(userId, []);
      userSocketMap.get(userId).push(socket.id);

      socket.join(`user_${userId}`); // ✅ Join user room
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }

    socket.on("join-channel", (channelId) => {
      socket.join(`channel_${channelId}`); // ✅ Join channel room
    });

    socket.on("add-channel-notify", addChannelNotify);
    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("delete-message", deleteMessageSocket);

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
