import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Select,
    SelectItem,
} from "@heroui/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { CREATE_CHANNEL, GET_ALL_CONTACTS } from "@/lib/constants";
import { useSocket } from "@/contexts/SocketContext";
import { useAppStore } from "@/store";

const CreateChannel = ({ isOpen, onOpenChange }) => {
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState("");
    const socket = useSocket();
    const { addChannel } = useAppStore();

    // Fetch all contacts
    useEffect(() => {
        const getData = async () => {
            try {
                const response = await apiClient.get(GET_ALL_CONTACTS, {
                    withCredentials: true,
                });
                setAllContacts(response.data.contacts);
            } catch (error) {
                console.error("Failed to fetch contacts", error);
            }
        };
        if (isOpen) getData(); // fetch only when modal is open
    }, [isOpen]);

    // Create new channel
    const createChannel = async () => {
        if (!channelName.trim() || selectedContacts.length === 0) return;

        try {
            const response = await apiClient.post(
                CREATE_CHANNEL,
                {
                    name: channelName,
                    members: selectedContacts,
                },
                { withCredentials: true }
            );

            if (response.status === 201) {
                setChannelName("");
                setSelectedContacts([]);
                onOpenChange(false);
                addChannel(response.data.channel);
                socket.emit("add-channel-notify", response.data.channel);
            }
        } catch (error) {
            console.error("Failed to create channel", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent className="bg-white text-black border rounded-lg w-[400px] h-max flex flex-col">
                <ModalHeader>
                    <h3 className="font-semibold text-lg">Create a new Channel</h3>
                </ModalHeader>
                <ModalBody className="flex flex-col gap-4">
                    {/* Channel Name Input */}
                    <Input
                        placeholder="Channel Name"
                        className="rounded-lg py-6 px-4 border"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                    />

                    {/* Contact Selector (HeroUI Select Multiple) */}
                    <Select
                        label="Select Contacts"
                        selectionMode="multiple"
                        placeholder="Search Contacts"
                        selectedKeys={selectedContacts}
                        onSelectionChange={(keys) =>
                            setSelectedContacts(Array.from(keys))

                        }
                    >
                        {allContacts.map((contact) => (
                            <SelectItem key={contact.value} value={contact.value}>
                                {contact.label}
                            </SelectItem>
                        ))}
                    </Select>

                    {/* Create Button */}
                    <Button
                        onClick={createChannel}
                        className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300"
                    >
                        Create Channel
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CreateChannel;
