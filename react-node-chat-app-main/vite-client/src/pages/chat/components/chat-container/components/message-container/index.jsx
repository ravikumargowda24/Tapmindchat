import { Avatar } from "@heroui/avatar";
import apiClient from "@/lib/api-client";
import {
    FETCH_ALL_MESSAGES_ROUTE,
    GET_CHANNEL_MESSAGES,
    HOST,
    MESSAGE_TYPES,
    DELETE_MESSAGE_ROUTE,
} from "@/lib/constants";
import { useAppStore } from "@/store";
import moment from "moment";
import { FiMoreVertical } from "react-icons/fi";
import { useSocket } from "@/contexts/SocketContext";
import { useEffect, useRef, useState } from "react";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { MdFolderZip } from "react-icons/md";
import { motion } from "framer-motion";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@heroui/react";

// HeroUI dropdown
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/dropdown";

// Lucide icons
import { Trash2, Pin, Forward, PinOff } from "lucide-react";
import ForwardModal from "./forward-modal";

const MessageMenu = ({ message, userInfo, onDelete, onPin, onForward }) => {
    const isMine = message.sender === userInfo.id;
    const isAdmin = userInfo.role === "admin";

    const renderItems = () => {
        if (isAdmin) {
            return (
                <>
                    <DropdownItem
                        key="delete"
                        startContent={<Trash2 size={16} />}
                        className="text-red-500"
                        onClick={() => onDelete(message)}
                    >
                        Delete
                    </DropdownItem>
                    <DropdownItem
                        key="pin"
                        startContent={<Pin size={16} />}
                        onClick={() => onPin(message)}
                    >
                        Pin
                    </DropdownItem>
                    <DropdownItem
                        key="forward"
                        startContent={<Forward size={16} />}
                        onClick={() => onForward(message)}
                    >
                        Forward
                    </DropdownItem>
                </>
            );
        }

        if (isMine) {
            return (
                <>
                    <DropdownItem
                        key="delete"
                        startContent={<Trash2 size={16} />}
                        className="text-red-500"
                        onClick={() => onDelete(message)}
                    >
                        Delete
                    </DropdownItem>
                    <DropdownItem
                        key="pin"
                        startContent={<Pin size={16} />}
                        onClick={() => onPin(message)}
                    >
                        Pin
                    </DropdownItem>
                    <DropdownItem
                        key="forward"
                        startContent={<Forward size={16} />}
                        onClick={() => onForward(message)}
                    >
                        Forward
                    </DropdownItem>
                </>
            );
        }

        // Other member's message
        return (
            <>
                <DropdownItem
                    key="delete"
                    startContent={<Trash2 size={16} />}
                    className="text-red-500"
                    onClick={() => onDelete(message)}
                >
                    Delete
                </DropdownItem>
                <DropdownItem
                    key="pin"
                    startContent={<Pin size={16} />}
                    onClick={() => onPin(message)}
                >
                    Pin
                </DropdownItem>
                <DropdownItem
                    key="forward"
                    startContent={<Forward size={16} />}
                    onClick={() => onForward(message)}
                >
                    Forward
                </DropdownItem>
            </>
        );
    };

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <div className="ml-2 flex items-center cursor-pointer hover:text-black">
                    <FiMoreVertical size={18} />
                </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Message Actions">{renderItems()}</DropdownMenu>
        </Dropdown>
    );
};

const MessageContainer = () => {
    const [showImage, setShowImage] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [forwardModalOpen, setForwardModalOpen] = useState(false);
    const [messageToForward, setMessageToForward] = useState(null);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [size, setSize] = useState("md");

    const handleOpen = (size) => {
        setSize(size);
        onOpen();
    };

    const {
        selectedChatData,
        setSelectedChatMessages,
        selectedChatMessages,
        selectedChatType,
        userInfo,
        setDownloadProgress,
        setIsDownloading,
        removeMessage,
    } = useAppStore();

    const messageEndRef = useRef(null);
    const socket = useSocket()



    // Load pinned messages from localStorage on mount
    useEffect(() => {
        const storedPins = localStorage.getItem("pinnedMessages");
        if (storedPins) {
            setPinnedMessages(JSON.parse(storedPins));
        }
    }, []);

    // // Persist pinned messages to localStorage whenever they change
    // useEffect(() => {
    //     localStorage.setItem("pinnedMessages", JSON.stringify(pinnedMessages));
    // }, [pinnedMessages]);

    const handlePin = (msg) => {
        const isPinned = pinnedMessages.find((m) => m._id === msg._id);
        if (isPinned) {
            setPinnedMessages(pinnedMessages.filter((m) => m._id !== msg._id));
        } else {
            setPinnedMessages([...pinnedMessages, msg]);
        }
        localStorage.setItem("pinnedMessages", JSON.stringify(pinnedMessages));
    };

    useEffect(() => {
        const getMessages = async () => {
            try {
                const response = await apiClient.post(
                    FETCH_ALL_MESSAGES_ROUTE,
                    { id: selectedChatData._id },
                    { withCredentials: true }
                );
                if (response.data.messages && Array.isArray(response.data.messages)) {
                    setSelectedChatMessages(response.data.messages);
                } else {
                    setSelectedChatMessages([]);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
                setSelectedChatMessages([]);
            }
        };

        const getChannelMessages = async () => {
            try {
                const response = await apiClient.get(
                    `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
                    { withCredentials: true }
                );
                if (response.data.messages && Array.isArray(response.data.messages)) {
                    setSelectedChatMessages(response.data.messages);
                } else {
                    setSelectedChatMessages([]);
                }
            } catch (error) {
                console.error("Error fetching channel messages:", error);
                setSelectedChatMessages([]);
            }
        };

        if (selectedChatData._id) {
            if (selectedChatType === "contact") getMessages();
            else if (selectedChatType === "channel") getChannelMessages();
        } else {
            setSelectedChatMessages([]);
        }
    }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChatMessages]);

    // useEffect(() => {
    //     if (socket) {
    //         const handleMessageDeleted = (data) => {
    //             setSelectedChatMessages((prev) =>
    //                 Array.isArray(prev) ? prev.filter((msg) => msg._id !== data.messageId) : []
    //             );
    //         };

    //         socket.on("message-deleted", handleMessageDeleted);

    //         return () => {
    //             socket.off("message-deleted", handleMessageDeleted);
    //         };
    //     }
    // }, [socket, setSelectedChatMessages]);

    const checkIfImage = (filePath) => {
        const imageRegex =
            /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
        return imageRegex.test(filePath);
    };

    const downloadFile = async (url) => {
        setIsDownloading(true);
        setDownloadProgress(0);

        const response = await apiClient.get(`${HOST}/${url}`, {
            responseType: "blob",
            onDownloadProgress: (progressEvent) => {
                const { loaded, total } = progressEvent;
                setDownloadProgress(Math.round((loaded * 100) / total));
            },
        });

        const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = urlBlob;
        link.setAttribute("download", url.split("/").pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(urlBlob);

        setIsDownloading(false);
        setDownloadProgress(0);
    };


    const handleDelete = async (message) => {
        try {
            const response = await apiClient.delete(DELETE_MESSAGE_ROUTE, {
                data: { messageId: message._id },
                withCredentials: true,
            });
            if (response.status === 200) {
                const { messageId, senderId, recipientId, channelId } = response.data;
                socket.emit("delete-message", {
                    messageId,
                    senderId,
                    recipientId,
                    channelId: selectedChatType === "channel" ? (channelId || selectedChatData._id) : null,
                });
                removeMessage(messageId);
            }
        } catch (error) {
            console.log("Delete failed:", error);
        }
    };


    // const handleDelete = async (message) => {
    //     try {
    //         const response = await apiClient.delete(DELETE_MESSAGE_ROUTE, {
    //             data: { messageId: message._id },
    //             withCredentials: true,
    //         });

    //         if (response.status === 200) {
    //             // emit with optional userId for server permission checks
    //             socket.emit("delete-message", {
    //                 messageId: message._id,
    //                 channelId: selectedChatType === "channel" ? selectedChatData._id : null,
    //                 userId: userInfo?.id,
    //             });
    //             deleteMessage(response.messageId)

    //         }


    //     } catch (error) {
    //         console.log("Delete failed:", error);
    //     }
    // }
    const handleForward = (msg) => {
        setMessageToForward(msg);
        setForwardModalOpen(true);
    };

    const renderPersonalMessages = (message, index) => {
        const isReceiver = message.sender === selectedChatData._id;

        return (
            <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, type: "spring", stiffness: 300 }}
                className={`flex ${isReceiver ? "justify-start" : "justify-end"} my-2`}
            >
                <div className="relative flex items-start">
                    <div
                        className={`relative max-w-[65%] px-4 py-2 text-sm shadow-sm
              ${isReceiver
                                ? "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200"
                                : "bg-[#8417ff]/10 text-[#8417ff] rounded-2xl rounded-tr-sm border border-[#8417ff]/30"
                            }`}
                    >
                        {/* Sender name for DM messages */}
                        {isReceiver && (
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                                {selectedChatData.firstName}    
                            </div>
                        )}
                        {message.messageType === MESSAGE_TYPES.TEXT && (
                            <span>
                                {message.content}
                                {message.forwarded && <span className="text-xs text-blue-400 ml-1">(forwarded)</span>}
                            </span>
                        )}

                        {message.messageType === MESSAGE_TYPES.FILE &&
                            (checkIfImage(message.fileUrl) ? (
                                <div
                                    className="cursor-pointer mt-1"
                                    onClick={() => {
                                        setShowImage(true);
                                        setImageURL(message.fileUrl);
                                    }}
                                >
                                    <img
                                        src={`${HOST}/${message.fileUrl}`}
                                        alt="file"
                                        className="rounded-lg shadow-md"
                                        width={250}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-gray-600 text-xl bg-gray-200 rounded-full p-2">
                                        <MdFolderZip />
                                    </span>
                                    <span className="truncate text-sm max-w-[140px]">
                                        {message.fileUrl.split("/").pop()}
                                    </span>
                                    <span
                                        className="bg-gray-200 p-2 text-lg rounded-full hover:bg-gray-300 cursor-pointer transition"
                                        onClick={() => downloadFile(message.fileUrl)}
                                    >
                                        <IoMdArrowRoundDown />
                                    </span>
                                </div>
                            ))}

                        <span className="block text-[10px] text-gray-400 mt-1 text-right">
                            {moment(message.timestamp).format("LT")}
                        </span>
                    </div>

                    <MessageMenu
                        message={message}
                        userInfo={userInfo}
                        onDelete={() => { handleDelete(message) }}
                        onPin={handlePin}
                        onForward={handleForward}
                    />
                </div>
            </motion.div>
        );
    };

    const renderChannelMessages = (message, index) => {
        const isSender = message.sender._id === userInfo.id;

        return (
            <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, type: "spring", stiffness: 300 }}
                className={`flex ${isSender ? "justify-end" : "justify-start"} my-2`}
            >
                <div className="relative flex items-start">
                    <div
                        className={`relative max-w-[65%] px-4 py-2 text-sm shadow-sm
              ${isSender
                                ? "bg-[#8417ff]/10 text-[#8417ff] rounded-2xl rounded-tr-sm border border-[#8417ff]/30"
                                : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-200"
                            }`}
                    >
                        {/* Sender name for channel messages */}
                        <div className={`text-xs font-semibold mb-1 ${isSender ? 'text-[#8417ff]/80' : 'text-gray-600'}`}>
                            {isSender ? 'You' : `${message.sender.firstName}`}
                        </div>
                        {message.messageType === MESSAGE_TYPES.TEXT && (
                            <span>
                                {message.content}
                                {message.forwarded && <span className="text-xs text-blue-400 ml-1">(forwarded)</span>}
                            </span>
                        )}

                        {message.messageType === MESSAGE_TYPES.FILE &&
                            (checkIfImage(message.fileUrl) ? (
                                <div
                                    className="cursor-pointer mt-1"
                                    onClick={() => {
                                        setShowImage(true);
                                        setImageURL(message.fileUrl);
                                    }}
                                >
                                    <img
                                        src={`${HOST}/${message.fileUrl}`}
                                        alt="file"
                                        className="rounded-lg shadow-md"
                                        width={250}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-gray-600 text-xl bg-gray-200 rounded-full p-2">
                                        <MdFolderZip />
                                    </span>
                                    <span className="truncate text-sm max-w-[140px]">
                                        {message.fileUrl.split("/").pop()}
                                    </span>
                                    <span
                                        className="bg-gray-200 p-2 text-lg rounded-full hover:bg-gray-300 cursor-pointer transition"
                                        onClick={() => downloadFile(message.fileUrl)}
                                    >
                                        <IoMdArrowRoundDown />
                                    </span>
                                </div>
                            ))}

                        <span className="block text-[10px] text-gray-400 mt-1 text-right">
                            {moment(message.timestamp).format("LT")}
                        </span>
                    </div>

                    <MessageMenu
                        message={message}
                        userInfo={userInfo}
                        onDelete={() => { handleDelete(message) }}
                        onPin={handlePin}
                        onForward={handleForward}
                    />
                </div>
            </motion.div>
        );
    };

    const renderMessages = () => {
        let lastDate = null;
        if (!Array.isArray(selectedChatMessages)) {
            return null;
        }
        return selectedChatMessages.map((message, index) => {
            const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
            const showDate = messageDate !== lastDate;
            lastDate = messageDate;

            return (
                <div key={index}>
                    {showDate && (
                        <div className="text-center text-gray-400 my-2 text-sm">
                            {moment(message.timestamp).format("LL")}
                        </div>
                    )}
                    {selectedChatType === "contact"
                        ? renderPersonalMessages(message, index)
                        : renderChannelMessages(message, index)}
                </div>
            );
        });
    };

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full bg-white relative">
            {renderMessages()}
            <div ref={messageEndRef} />

            {/* Floating Pin Button */}
            {pinnedMessages.length > 0 && (
                <div
                    className="fixed top-25 right-5 bg-[#ebeefa] p-1 rounded-lg shadow-lg cursor-pointer z-50 flex items-center gap-2 text-[#3a64d6] border border-[#3a64d6]"
                    onClick={() => handleOpen("md")}
                >
                    <Pin size={20} color="#3a64d6" />
                    {pinnedMessages.length}
                </div>
            )}

            {/* Pinned Messages Modal */}
            <Modal isOpen={isOpen} size={size} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Pinned Messages</span>

                            </ModalHeader>
                            <ModalBody>
                                {pinnedMessages.length > 0 ? (
                                    pinnedMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3  rounded mb-2 flex justify-between items-center"
                                        >
                                            <span>{msg.content}</span>
                                            <Button
                                                size="small"
                                                variant="destructive"
                                                onPress={() => handlePin(msg)}
                                            >
                                                <PinOff />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500">No pinned messages</div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Image Preview Modal */}
            {showImage && (
                <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg bg-black/50 flex-col">
                    <div>
                        <img
                            src={`${HOST}/${imageURL}`}
                            className="h-[80vh] w-auto rounded-md shadow-lg"
                            alt=""
                        />
                    </div>
                    <div className="flex gap-5 fixed top-0 mt-5">
                        <button
                            className="bg-gray-200 p-3 text-2xl rounded-full hover:bg-gray-300 cursor-pointer transition-all duration-300"
                            onClick={() => downloadFile(imageURL)}
                        >
                            <IoMdArrowRoundDown />
                        </button>
                        <button
                            className="bg-gray-200 p-3 text-2xl rounded-full hover:bg-gray-300 cursor-pointer transition-all duration-300"
                            onClick={() => {
                                setShowImage(false);
                                setImageURL(null);
                            }}
                        >
                            <IoCloseSharp />
                        </button>
                    </div>
                </div>
            )}

            {/* Forward Message Modal */}
            <ForwardModal
                isOpen={forwardModalOpen}
                onClose={() => {
                    setForwardModalOpen(false);
                    setMessageToForward(null);
                }}
                message={messageToForward}
            />
        </div>
    );
};


export default MessageContainer;
