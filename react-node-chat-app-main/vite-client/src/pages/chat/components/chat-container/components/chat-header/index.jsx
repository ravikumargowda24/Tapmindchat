import { RiCloseFill } from "react-icons/ri";
import { Avatar } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { HOST } from "@/lib/constants";
import { getColor } from "@/lib/utils";
import moment from "moment";

const ChatHeader = () => {
    const { selectedChatData, closeChat, selectedChatType } = useAppStore();

    const getLastSeenText = () => {
        if (!selectedChatData?.lastMessageTime) return null;

        const lastSeen = moment(selectedChatData.lastMessageTime);
        const now = moment();

        if (now.diff(lastSeen, "minutes") < 5) {
            return "Online";
        } else {
            return `Last seen: ${lastSeen.fromNow()}`;
        }
    };

    return (
        <div className="h-[10vh] border-b border-gray-200 bg-white flex items-center justify-between px-6 shadow-sm">
            <div className="flex gap-4 items-center">
                <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 relative flex items-center justify-center">
                        {selectedChatType === "contact" ? (
                            <Avatar className="w-12 h-12 rounded-full overflow-hidden">
                                {selectedChatData.image ? (
                                    <img
                                        src={`${HOST}/${selectedChatData.image}`}
                                        alt="profile"
                                        className="object-cover w-full h-full rounded-full"
                                    />
                                ) : (
                                    <div
                                        className={`uppercase w-12 h-12 text-lg font-medium border ${getColor(
                                            selectedChatData.color
                                        )} flex items-center justify-center rounded-full`}
                                    >
                                        {selectedChatData.firstName
                                            ? selectedChatData.firstName[0]
                                            : selectedChatData.email[0]}
                                    </div>
                                )}
                            </Avatar>
                        ) : (
                            <div className="bg-gray-200 py-3 px-5 flex items-center justify-center rounded-full text-gray-700 font-semibold">
                                #
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="text-gray-900 font-medium">
                            {selectedChatType === "channel" && selectedChatData.name}
                            {selectedChatType === "contact" &&
                                selectedChatData.firstName &&
                                selectedChatData.lastName
                                ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                                : ""}
                        </div>
                        {selectedChatType === "contact" && (
                            <div className="text-sm text-gray-500">
                                {getLastSeenText()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button
                    className="text-gray-500 hover:text-red-500 focus:outline-none transition-all duration-200"
                    onClick={closeChat}
                >
                    <RiCloseFill className="text-3xl cursor-pointer" />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
