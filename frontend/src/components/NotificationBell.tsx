import React, { useState, useEffect } from 'react';
import {
    Box,
    IconButton,
    Badge,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverArrow,
    PopoverCloseButton,
    VStack,
    Text,
    Spinner,
    Flex,
    Icon,
} from '@chakra-ui/react';
import { FiBell, FiInfo } from 'react-icons/fi';

interface NotificationBellProps {
    userId: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/notifications?user_id=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.is_read).length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT'
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (userId) {
            fetchNotifications();
            // Optional: Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    return (
        <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-end">
            <PopoverTrigger>
                <Box position="relative" display="inline-block">
                    <IconButton
                        aria-label="Notifications"
                        icon={<FiBell />}
                        variant="ghost"
                        colorScheme="teal"
                        size="md"
                        onClick={handleOpen}
                    />
                    {unreadCount > 0 && (
                        <Badge
                            colorScheme="red"
                            borderRadius="full"
                            position="absolute"
                            top="-2px"
                            right="-2px"
                            fontSize="0.7em"
                            zIndex={2}
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Box>
            </PopoverTrigger>
            <PopoverContent w="350px" boxShadow="xl">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader fontWeight="bold" borderBottomWidth="1px">Notifications</PopoverHeader>
                <PopoverBody maxH="400px" overflowY="auto" p={0}>
                    {loading ? (
                        <Flex justify="center" p={4}><Spinner size="sm" /></Flex>
                    ) : notifications.length === 0 ? (
                        <Text p={4} color="gray.500" textAlign="center" fontSize="sm">No notifications</Text>
                    ) : (
                        <VStack align="stretch" spacing={0} divider={<Box borderBottomWidth="1px" borderColor="gray.100" />}>
                            {notifications.map((notif) => (
                                <Box
                                    key={notif.id}
                                    p={3}
                                    bg={notif.is_read ? 'white' : 'teal.50'}
                                    _hover={{ bg: 'gray.50' }}
                                    cursor="pointer"
                                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    transition="all 0.2s"
                                >
                                    <Flex align="start" gap={3}>
                                        <Icon
                                            as={notif.type === 'soap_note' ? FiInfo : FiBell}
                                            color={notif.is_read ? 'gray.400' : 'teal.500'}
                                            mt={1}
                                        />
                                        <Box flex="1">
                                            <Text fontSize="sm" fontWeight={notif.is_read ? "normal" : "bold"} color="gray.800">
                                                {notif.message}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                {new Date(notif.created_at).toLocaleString()}
                                            </Text>
                                        </Box>
                                        {!notif.is_read && (
                                            <Box w="8px" h="8px" bg="teal.500" borderRadius="full" mt={2} />
                                        )}
                                    </Flex>
                                </Box>
                            ))}
                        </VStack>
                    )}
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
