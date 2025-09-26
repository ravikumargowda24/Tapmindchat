import { HOST } from "@/lib/constants";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/ui/avatar";

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
    console.log(selectedChatData, "selectedChatData")
    return (
        <div className="mt-5">
            {contacts.map((contact) => (
                <div
                    key={contact._id}
                    className={`pl-2 py-2 transition-all duration-300 cursor-pointer shadow-lg rounded-xl ${selectedChatData && selectedChatData._id === contact._id
                        ? "bg-[#d9c3f1] text-black "
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                    onClick={() => handleClick(contact)}
                >
                    <div className="flex gap-5 items-center justify-start">
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
                            <div className="bg-gray-200 text-gray-700 h-10 w-10 flex items-center justify-center rounded-full">
                                #
                            </div>
                        )}
                        {isChannel ? (
                            <span>{contact.name}</span>
                        ) : (
                            <span>{`${contact.firstName} ${contact.lastName}`}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ContactList;
