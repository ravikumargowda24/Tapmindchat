import ContactList from "@/components/common/contact-list";
import Logo from "@/components/common/logo";
import ProfileInfo from "./components/profile-info";
import apiClient from "@/lib/api-client";
import {
    GET_CONTACTS_WITH_MESSAGES_ROUTE,
    GET_USER_CHANNELS,
} from "@/lib/constants";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";

import { Tabs, Tab } from "@heroui/react";
import { useEffect, useState } from "react";
import { MessageCirclePlus, Search } from "lucide-react";
import { useAppStore } from "@/store";
import { motion } from "framer-motion";
import NewDM from "./components/new-dm/new-dm";
import CreateChannel from "./components/create-channel/create-channel";

const ContactsContainer = () => {
    const {
        setDirectMessagesContacts,
        directMessagesContacts,
        channels,
        setChannels,
    } = useAppStore();

    // modal states
    const [isNewDMOpen, setIsNewDMOpen] = useState(false);
    const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const getContactsWithMessages = async () => {
            const response = await apiClient.get(
                GET_CONTACTS_WITH_MESSAGES_ROUTE,
                {
                    withCredentials: true,
                }
            );
            if (response.data.contacts) {
                setDirectMessagesContacts(response.data.contacts);
            }
        };
        getContactsWithMessages();
    }, [setDirectMessagesContacts]);

    useEffect(() => {
        const getChannels = async () => {
            const response = await apiClient.get(GET_USER_CHANNELS, {
                withCredentials: true,
            });
            if (response.data.channels) {
                setChannels(response.data.channels);
            }
        };
        getChannels();
    }, [setChannels]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" },
        },
    };

    // Filter contacts based on search term
    const filterContacts = (contacts) => {
        if (!searchTerm) return contacts;
        return contacts.filter((contact) => {
            const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`;
            return name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };

    return (
        <motion.div
            className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-white border-r border-gray-200 w-full flex flex-col h-full"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header */}
            <div className="pt-4 pb-3 px-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Dropdown>
                            <DropdownTrigger>
                                <motion.div
                                    className="cursor-pointer bg-purple-500 w-8 h-8 rounded-full flex justify-center items-center text-white hover:bg-purple-600 transition-colors"
                                >
                                    <MessageCirclePlus size={16} />
                                </motion.div>
                            </DropdownTrigger>

                            <DropdownMenu aria-label="New Options" variant="flat">
                                <DropdownItem key="new-dm" onClick={() => setIsNewDMOpen(true)}>
                                    New DM
                                </DropdownItem>
                                <DropdownItem key="create-channel" onClick={() => setIsCreateChannelOpen(true)}>
                                    Create Channel
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </motion.div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mb-2">
                <Tabs aria-label="Chat Options" className="w-full">
                    <Tab key="direct" title={
                        <span className="text-xs font-semibold tracking-wider uppercase">
                            DIRECT
                        </span>
                    }>
                        <div className="mt-2">
                            <ContactList contacts={filterContacts(directMessagesContacts)} />
                        </div>
                    </Tab>
                    <Tab key="groups" title={
                        <span className="text-xs font-semibold tracking-wider uppercase">
                            GROUPS
                        </span>
                    }>
                        <div className="mt-2">
                            {channels && channels.length > 0 ? (
                                <ContactList contacts={filterContacts(channels)} isChannel />
                            ) : (
                                <div className="text-center text-gray-500 text-sm py-8">
                                    No groups
                                </div>
                            )}
                        </div>
                    </Tab>
                    <Tab key="public" title={
                        <span className="text-xs font-semibold tracking-wider uppercase">
                            PUBLIC
                        </span>
                    }>
                        <div className="mt-2">
                            <div className="text-center text-gray-500 text-sm py-8">
                                No public chats
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </div>

            {/* Spacer to push ProfileInfo to bottom */}
            <div className="flex-1"></div>

            <ProfileInfo />

            {/* Modals */}
            <NewDM isOpen={isNewDMOpen} onOpenChange={setIsNewDMOpen} />
            <CreateChannel isOpen={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen} />
        </motion.div>
    );
};

export default ContactsContainer;