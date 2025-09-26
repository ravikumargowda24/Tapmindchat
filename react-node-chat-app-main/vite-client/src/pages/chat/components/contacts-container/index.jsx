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
import { MessageCirclePlus } from "lucide-react";
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

    return (
        <motion.div
            className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-white border-r-2 border-gray-200 w-full"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="pt-3 flex justify-between items-center px-4">
                <Logo />
                <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="cursor-pointer bg-purple-500 w-10 h-10 rounded-full flex justify-center items-center"
                >
                    <Dropdown>
                        <DropdownTrigger>
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="cursor-pointer bg-purple-500 w-10 h-10 rounded-full flex justify-center items-center text-white"
                            >
                                <MessageCirclePlus />
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

            <motion.div
                className="flex w-full flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Tabs aria-label="Options">
                    <Tab key="Direct" title="Direct">
                        <motion.div
                            className="h-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <ContactList contacts={directMessagesContacts} />
                        </motion.div>
                    </Tab>
                    <Tab key="Group" title="Group">
                        <motion.div
                            className="h-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {channels ? (
                                <ContactList contacts={channels} isChannel />
                            ) : (
                                "No channels"
                            )}
                        </motion.div>
                    </Tab>
                </Tabs>
            </motion.div>

            <ProfileInfo />

            {/* Modals */}

            <NewDM isOpen={isNewDMOpen} onOpenChange={setIsNewDMOpen} />
            <CreateChannel isOpen={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen} />
        </motion.div>
    );
};

export default ContactsContainer;

const Title = ({ text }) => {
    return (
        <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
            {text}
        </h6>
    );
};
