import { HOST } from "@/lib/constants";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/ui/avatar";
import { FiMoreVertical } from "react-icons/fi";



const ContactList = ({ contacts, isChannel = false }) => {
    const {
        selectedChatData,
        setSelectedChatType,
        setSelectedChatData,
        setSelectedChatMessages,
    } = useAppStore();

    const handleClick = (contact) => {
        if (isChannel) setSelectedChatType("channel");
        else setSelectedChatType("contact");
        setSelectedChatData(contact);
        if (selectedChatData && selectedChatData._id !== contact._id) {
            setSelectedChatMessages([]);
        }
    };
    const darkColors = [
        // "#1E293B", // slate
        // "#0F172A", // dark navy
        // "#3B0764", // deep purple
        // "#450A0A", // deep red
        // "#14532D", // forest green
        // "#064E3B", // teal
        // "#1E3A8A", // royal blue
        "#581C87", // violet
    ];

    function getRandomDarkColor() {
        const index = Math.floor(Math.random() * darkColors.length);
        return darkColors[index];
    }
    console.log(selectedChatData, "selectedChatData")
    return (
        <div className="mt-5">
            {contacts.length > 0 ? (<>
                {
                    contacts.map((contact) => (
                        <div
                            key={contact._id}
                            className={`p-2 py-2 transition-all border border-violet-500 flex w-full duration-300 cursor-pointer shadow-lg rounded-xl h-18 my-3 ${selectedChatData && selectedChatData._id === contact._id
                                ? "bg-[#d9c3f1] text-black "
                                : "hover:bg-gray-100 text-gray-700"
                                }`}
                            onClick={() => handleClick(contact)}
                        >
                            <div className="flex gap-3 justify-between">
                                {!isChannel && (
                                    <Avatar className="h-10 w-10">
                                        {contact.image ? (
                                            <img
                                                src={`${HOST}/${contact.image}`}
                                                alt="profile"
                                                className="rounded-full object-cover h-full w-full"
                                            />
                                        ) : (
                                            <div
                                                className={`uppercase ${selectedChatData &&
                                                    selectedChatData._id === contact._id
                                                    ? "bg-[#ffffff22] border border-white/50 text-white"
                                                    : getColor(contact.color)
                                                    } h-10 w-10 flex items-center justify-center rounded-full`}
                                            >
                                                {contact.firstName?.[0]}
                                            </div>
                                        )}
                                    </Avatar>
                                )}
                                {isChannel && (
                                    <div
                                        style={{ backgroundColor: getRandomDarkColor() }}
                                        className="text-white h-10 w-10 flex items-center justify-center rounded-full"
                                    >
                                        G
                                    </div>
                                )}
                                {isChannel ? (
                                    <div className="flex flex-col">
                                        <span className="font-medium">{contact.name}</span>
                                        <span className="text-xs text-gray-500 truncate w-40">
                                            {contact.lastMessage ? contact.lastMessage : "No messages yet"}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <span className="font-medium">{`${contact.firstName}`}</span>
                                        <span className="text-xs text-gray-500 truncate w-40">
                                            {contact.lastMessage ? contact.lastMessage : "No messages yet"}
                                        </span>
                                    </div>
                                )}
                                {/* <div className="cursor-pointer flex items-center"><FiMoreVertical /></div> */}

                            </div>
                        </div>
                    ))
                }
            </>) : <div className="text-center text-gray-500 text-sm py-4">
                No Results
            </div>}
        </div>
    );
};

export default ContactList;
