import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    IconButton,
    VStack,
    HStack,
    Text,
    Input,
    Flex,
    Avatar,
    useDisclosure,
    Tooltip,
    Spinner,
} from '@chakra-ui/react';
import { FiMessageCircle, FiX, FiSend, FiActivity } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const AIChatbot: React.FC = () => {
    const { isOpen, onToggle } = useDisclosure();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm your BHCare Assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputValue })
            });
            const data = await response.json();

            const botMsg: Message = {
                id: Date.now() + 1,
                text: data.response || "I'm sorry, I'm having trouble connecting to the medical server right now. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const botMsg: Message = {
                id: Date.now() + 1,
                text: "Reconnect established. I'm here to help with health center inquiries!",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box position="fixed" bottom={{ base: "20px", md: "30px" }} right={{ base: "20px", md: "30px" }} zIndex={1000}>
            <AnimatePresence>
                {isOpen && (
                    <MotionBox
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        bg="white"
                        w={{ base: "calc(100vw - 40px)", sm: "350px" }}
                        maxW="350px"
                        h="500px"
                        borderRadius="2xl"
                        boxShadow="2xl"
                        border="1px solid"
                        borderColor="gray.100"
                        overflow="hidden"
                        display="flex"
                        flexDirection="column"
                        mb={4}
                    >
                        {/* Header */}
                        <Box bg="linear-gradient(135deg, #38b2ac 0%, #ed8936 100%)" p={4} color="white">
                            <Flex align="center" justify="space-between">
                                <HStack spacing={3}>
                                    <Avatar size="sm" icon={<FiActivity fontSize="1.2rem" />} bg="white" color="teal.500" />
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="bold" fontSize="md">BHCare AI</Text>
                                        <Text fontSize="xs" opacity={0.8}>Support Specialist</Text>
                                    </VStack>
                                </HStack>
                                <IconButton
                                    aria-label="Close"
                                    icon={<FiX />}
                                    variant="ghost"
                                    color="white"
                                    _hover={{ bg: 'whiteAlpha.200' }}
                                    onClick={onToggle}
                                    size="sm"
                                />
                            </Flex>
                        </Box>

                        {/* Chat Area */}
                        <Box flex="1" overflowY="auto" p={4} bg="gray.50">
                            <VStack align="stretch" spacing={4}>
                                {messages.map(msg => (
                                    <Flex
                                        key={msg.id}
                                        justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                                    >
                                        <Box
                                            maxW="80%"
                                            bg={msg.sender === 'user' ? 'teal.500' : 'white'}
                                            color={msg.sender === 'user' ? 'white' : 'gray.700'}
                                            p={3}
                                            borderRadius="xl"
                                            borderTopRightRadius={msg.sender === 'user' ? 'none' : 'xl'}
                                            borderTopLeftRadius={msg.sender === 'bot' ? 'none' : 'xl'}
                                            boxShadow="sm"
                                            border="1px solid"
                                            borderColor={msg.sender === 'user' ? 'teal.500' : 'gray.100'}
                                        >
                                            <Text fontSize="sm">{msg.text}</Text>
                                        </Box>
                                    </Flex>
                                ))}
                                {isLoading && (
                                    <Flex justify="flex-start">
                                        <Box bg="white" p={3} borderRadius="xl" borderTopLeftRadius="none" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                            <Spinner size="xs" color="teal.500" />
                                        </Box>
                                    </Flex>
                                )}
                                <div ref={messagesEndRef} />
                            </VStack>
                        </Box>

                        {/* Input Area */}
                        <Box p={4} bg="white" borderTop="1px solid" borderColor="gray.100">
                            <HStack spacing={2}>
                                <Input
                                    placeholder="Ask anything..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    borderRadius="full"
                                    bg="gray.50"
                                    border="none"
                                    _focus={{ bg: 'white', border: '1px solid', borderColor: 'teal.500' }}
                                    fontSize="sm"
                                />
                                <IconButton
                                    aria-label="Send"
                                    icon={<FiSend />}
                                    colorScheme="teal"
                                    borderRadius="full"
                                    onClick={handleSend}
                                    isDisabled={!inputValue.trim()}
                                />
                            </HStack>
                        </Box>
                    </MotionBox>
                )}
            </AnimatePresence>

            <Tooltip label="BHCare AI Help" placement="left">
                <Box
                    as={motion.div}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <IconButton
                        aria-label="Toggle Chat"
                        icon={isOpen ? <FiX fontSize="1.5rem" /> : <FiMessageCircle fontSize="1.5rem" />}
                        colorScheme="teal"
                        size="lg"
                        borderRadius="full"
                        boxShadow="lg"
                        onClick={onToggle}
                        bg="linear-gradient(135deg, #38b2ac 0%, #ed8936 100%)"
                        _hover={{ opacity: 0.9 }}
                    />
                </Box>
            </Tooltip>
        </Box>
    );
};

export default AIChatbot;
