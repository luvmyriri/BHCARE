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
    Badge,
    Collapse,
} from '@chakra-ui/react';
import { FiMessageCircle, FiX, FiSend, FiActivity, FiHelpCircle, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqCategory {
    label: string;
    emoji: string;
    items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
    {
        label: 'Appointments',
        emoji: '',
        items: [
            { question: 'How do I book an appointment?', answer: 'Log in to BHCare, go to your Dashboard, and click "Book Appointment". Select your preferred service, date, and time slot.' },
            { question: 'Can I reschedule my appointment?', answer: 'Yes! Go to your Appointments list, select the appointment you want to change and click "Reschedule".' },
            { question: 'How do I cancel an appointment?', answer: 'Open the appointment details in your dashboard and click "Cancel Appointment". Please cancel at least 24 hours in advance.' },
        ],
    },
    {
        label: 'Health Center',
        emoji: '',
        items: [
            { question: 'What are the clinic operating hours?', answer: 'The health center is open Monday–Friday, 8:00 AM – 5:00 PM. Dental is available Mon, Wed & Fri only.' },
            { question: 'What services are available?', answer: 'We offer General Consultation, Dental Care, Prenatal/Maternal, Immunization, Family Planning, TB/DOTS, Nutrition Counseling, and Cervical Cancer Screening.' },
            { question: 'Where is Barangay 174 Health Center?', answer: 'We are located in Barangay 174, Caloocan City. Please contact administration for the exact address.' },
        ],
    },
    {
        label: 'My Records',
        emoji: '',
        items: [
            { question: 'How do I view my medical history?', answer: 'Log in to BHCare and go to "Medical History" from your dashboard to see records from previous visits.' },
            { question: 'Can I update my personal information?', answer: 'Yes, go to your Profile Settings to update contact details, address, and other personal information.' },
            { question: 'Is my data private and secure?', answer: 'Absolutely. All patient data is encrypted and only accessible by authorized health center staff and the patient themselves.' },
        ],
    },
    {
        label: 'Prescriptions',
        emoji: '',
        items: [
            { question: 'How do I get a prescription?', answer: 'Prescriptions are issued by the doctor during your consultation. They will appear in your Medical History records after the visit.' },
            { question: 'Can I request medicine refills online?', answer: 'Medicine refills require a follow-up consultation. Please book an appointment with your doctor.' },
        ],
    },
];

const AIChatbot: React.FC = () => {
    const { isOpen, onToggle } = useDisclosure();
    const [activeTab, setActiveTab] = useState<'faq' | 'chat'>('faq');
    const [openCategory, setOpenCategory] = useState<string | null>('Appointments');
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && activeTab === 'chat') scrollToBottom();
    }, [messages, isOpen, activeTab]);

    const handleSend = async (text?: string) => {
        const msgText = text || inputValue;
        if (!msgText.trim()) return;

        // Switch to chat tab when sending
        setActiveTab('chat');

        const userMsg: Message = {
            id: Date.now(),
            text: msgText,
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
                body: JSON.stringify({ message: msgText })
            });
            const data = await response.json();
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: data.response || "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                sender: 'bot',
                timestamp: new Date()
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Here's a tip: You can also browse the FAQ tab for quick answers to common questions!",
                sender: 'bot',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFaqClick = (item: FaqItem) => {
        // Show Q&A inline in chat
        setActiveTab('chat');
        setMessages(prev => [...prev,
        { id: Date.now(), text: item.question, sender: 'user', timestamp: new Date() },
        { id: Date.now() + 1, text: item.answer, sender: 'bot', timestamp: new Date() }
        ]);
    };

    return (
        <Box position="fixed" bottom={{ base: '20px', md: '30px' }} right={{ base: '20px', md: '30px' }} zIndex={1000}>
            <AnimatePresence>
                {isOpen && (
                    <MotionBox
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        bg="white"
                        w={{ base: 'calc(100vw - 40px)', sm: '360px' }}
                        maxW="360px"
                        h="520px"
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
                            <Flex align="center" justify="space-between" mb={3}>
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

                            {/* Tab switcher */}
                            <HStack spacing={2}>
                                <Box
                                    as="button"
                                    px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold"
                                    bg={activeTab === 'faq' ? 'white' : 'whiteAlpha.200'}
                                    color={activeTab === 'faq' ? 'teal.600' : 'white'}
                                    _hover={{ bg: activeTab === 'faq' ? 'white' : 'whiteAlpha.300' }}
                                    onClick={() => setActiveTab('faq')}
                                    transition="all 0.15s"
                                    display="flex" alignItems="center" gap="6px"
                                >
                                    <FiHelpCircle size={12} />  FAQs
                                </Box>
                                <Box
                                    as="button"
                                    px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold"
                                    bg={activeTab === 'chat' ? 'white' : 'whiteAlpha.200'}
                                    color={activeTab === 'chat' ? 'teal.600' : 'white'}
                                    _hover={{ bg: activeTab === 'chat' ? 'white' : 'whiteAlpha.300' }}
                                    onClick={() => setActiveTab('chat')}
                                    transition="all 0.15s"
                                    display="flex" alignItems="center" gap="6px"
                                >
                                    <FiMessageCircle size={12} />  Chat
                                    {messages.length > 1 && (
                                        <Badge bg="orange.400" color="white" borderRadius="full" fontSize="2xs" ml={1} px={1}>
                                            {messages.length - 1}
                                        </Badge>
                                    )}
                                </Box>
                            </HStack>
                        </Box>

                        {/* FAQ Tab */}
                        {activeTab === 'faq' && (
                            <Box flex="1" overflowY="auto" bg="gray.50">
                                <Box px={4} py={3}>
                                    <Text fontSize="xs" color="gray.400" fontWeight="medium" mb={2}>
                                        Tap a question to get an instant answer in Chat →
                                    </Text>
                                </Box>
                                <VStack align="stretch" spacing={0} px={3} pb={3}>
                                    {FAQ_DATA.map((cat) => (
                                        <Box key={cat.label} mb={2}>
                                            {/* Category header */}
                                            <Flex
                                                as="button"
                                                w="full"
                                                align="center"
                                                justify="space-between"
                                                bg="white"
                                                px={3} py={2}
                                                borderRadius="xl"
                                                boxShadow="sm"
                                                border="1px solid"
                                                borderColor="gray.100"
                                                onClick={() => setOpenCategory(openCategory === cat.label ? null : cat.label)}
                                                _hover={{ bg: 'teal.50' }}
                                                transition="all 0.15s"
                                            >
                                                <HStack spacing={2}>
                                                    <Text fontSize="md">{cat.emoji}</Text>
                                                    <Text fontSize="sm" fontWeight="bold" color="teal.700">{cat.label}</Text>
                                                    <Badge colorScheme="teal" variant="subtle" fontSize="2xs">{cat.items.length}</Badge>
                                                </HStack>
                                                {openCategory === cat.label ? <FiChevronDown size={14} color="#718096" /> : <FiChevronRight size={14} color="#718096" />}
                                            </Flex>

                                            {/* Questions */}
                                            <Collapse in={openCategory === cat.label} animateOpacity>
                                                <VStack align="stretch" spacing={1} mt={1} pl={2}>
                                                    {cat.items.map((item, i) => (
                                                        <Box
                                                            key={i}
                                                            as="button"
                                                            textAlign="left"
                                                            px={3} py={2}
                                                            bg="white"
                                                            borderRadius="lg"
                                                            border="1px solid"
                                                            borderColor="gray.100"
                                                            _hover={{ bg: 'orange.50', borderColor: 'orange.200' }}
                                                            transition="all 0.15s"
                                                            onClick={() => handleFaqClick(item)}
                                                        >
                                                            <Text fontSize="xs" color="gray.700" fontWeight="medium">{item.question}</Text>
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </Collapse>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        )}

                        {/* Chat Tab */}
                        {activeTab === 'chat' && (
                            <>
                                <Box flex="1" overflowY="auto" p={4} bg="gray.50">
                                    <VStack align="stretch" spacing={4}>
                                        {messages.map(msg => (
                                            <Flex key={msg.id} justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'}>
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
                                            onClick={() => handleSend()}
                                            isDisabled={!inputValue.trim()}
                                        />
                                    </HStack>
                                </Box>
                            </>
                        )}
                    </MotionBox>
                )}
            </AnimatePresence>

            <Tooltip label="BHCare AI Help" placement="left">
                <Box as={motion.div} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
