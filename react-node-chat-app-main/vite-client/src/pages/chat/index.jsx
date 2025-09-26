import { useEffect } from "react";
import ChatContainer from "./components/chat-container";
import ContactsContainer from "./components/contacts-container";
import { useAppStore } from "../../store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EmptyChatContainer from "./components/empty-chat-container";
import { useSocket } from "../../contexts/SocketContext";

const Chat = () => {
    const {
        userInfo,
        selectedChatType,
        isUploading,
        fileUploadProgress,
        isDownloading,
        downloadProgress,
        setSelectedChatMessages, // Add this
    } = useAppStore();
    const navigate = useNavigate();
    const socket = useSocket(); // Add this

    useEffect(() => {
        if (!userInfo.profileSetup) {
            toast("Please setup profile to continue.");
            navigate("/profile");
        }
    }, [userInfo, navigate]);

    useEffect(() => {
        if (socket) {
            const handleMessageDeleted = (data) => {
                setSelectedChatMessages((prev) =>
                    prev.filter((msg) => msg._id !== data.messageId)
                );
            };

            socket.on("message-deleted", handleMessageDeleted);

            return () => {
                socket.off("message-deleted", handleMessageDeleted);
            };
        }
    }, [socket, setSelectedChatMessages]);

    return (
        <div className="flex h-[100vh] text-white overflow-hidden">
            {isUploading && (
                <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5">
                    <h5 className="text-5xl animate-pulse">Uploading File</h5>
                    {fileUploadProgress}%
                </div>
            )}
            {isDownloading && (
                <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5">
                    <h5 className="text-5xl animate-pulse">Downloading File</h5>
                    {downloadProgress}%
                </div>
            )}
            <ContactsContainer />
            {selectedChatType === undefined ? (
                <EmptyChatContainer />
            ) : (
                <ChatContainer />
            )}
        </div>
    );
};

export default Chat;
