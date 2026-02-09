import React, { useState } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    useToast,
    Flex,
    Icon,
    Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MessageIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
    </Icon>
);

const SendIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </Icon>
);

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '+63',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // Remove invalid characters
            let cleaned = value.replace(/[^0-9+]/g, '');

            // Handle paste cases or user typing 09/63
            if (cleaned.startsWith('09')) {
                cleaned = '+63' + cleaned.substring(1);
            } else if (cleaned.startsWith('63') && !cleaned.startsWith('+63')) {
                cleaned = '+' + cleaned;
            } else if (cleaned.startsWith('9')) {
                cleaned = '+63' + cleaned;
            }

            // Enforce +63 prefix
            if (!cleaned.startsWith('+63')) {
                // If the user cleared everything or typed something else, reset/prepend
                // Remove all non-digits to be safe
                const digits = cleaned.replace(/\D/g, '');
                cleaned = '+63' + digits;
            }

            // Limit length: +63 (3 chars) + 10 digits = 13 chars
            if (cleaned.length > 13) {
                cleaned = cleaned.substring(0, 13);
            }

            setFormData({ ...formData, phone: cleaned });
            return;
        }

        if (name === 'name') {
            // Allow letters, spaces, hyphens, and apostrophes
            const cleaned = value.replace(/[^a-zA-Z\s'-.]/g, '');
            setFormData({ ...formData, name: cleaned });
            return;
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // New Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast({
                title: 'Invalid Email',
                description: 'Please enter a valid email address.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
            return;
        }

        // Allow empty check (just +63) for optional field, but if entered, must be valid
        if (formData.phone && formData.phone !== '+63' && formData.phone.length < 13) {
            toast({
                title: 'Invalid Phone Number',
                description: 'Please enter a valid contact number starting with +63.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            toast({
                title: 'Message Sent!',
                description: 'Thank you for contacting us. We will get back to you soon.',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
            setFormData({ name: '', email: '', phone: '+63', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <Box id="contact" py={20} bg="transparent" position="relative" overflow="hidden">
            {/* Background Decoration */}
            <Box
                position="absolute"
                right="-10%"
                top="10%"
                boxSize="500px"
                bg="teal.100"
                borderRadius="full"
                filter="blur(100px)"
                opacity={0.4}
                zIndex={0}
            />

            <Container maxW="6xl" position="relative" zIndex={1}>
                {/* Section Header */}
                <Flex direction="column" alignItems="center" mb={12} textAlign="center">
                    <Badge colorScheme="teal" px={3} py={1} rounded="full" mb={4}>
                        GET IN TOUCH
                    </Badge>
                    <Heading
                        as="h2"
                        fontSize={{ base: "3xl", md: "5xl" }}
                        color="teal.900"
                        fontWeight="800"
                        letterSpacing="tight"
                        mb={4}
                    >
                        <Flex alignItems="center" justifyContent="center" gap={3}>
                            <MessageIcon boxSize={10} color="teal.600" />
                            Contact Us
                        </Flex>
                    </Heading>
                    <Text fontSize="lg" color="gray.600" maxW="2xl">
                        Have questions or concerns? We're here to help. Send us a message and our team will respond as soon as possible.
                    </Text>
                </Flex>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <Box
                        bg="white"
                        p={{ base: 6, md: 10 }}
                        borderRadius="3xl"
                        boxShadow="2xl"
                        border="1px solid"
                        borderColor="gray.100"
                    >
                        <form onSubmit={handleSubmit}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                                <FormControl isRequired>
                                    <FormLabel color="gray.700" fontWeight="600">Full Name</FormLabel>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Juan Dela Cruz"
                                        size="lg"
                                        borderRadius="xl"
                                        borderColor="gray.300"
                                        _hover={{ borderColor: 'teal.400' }}
                                        _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel color="gray.700" fontWeight="600">Email Address</FormLabel>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="juan@example.com"
                                        size="lg"
                                        borderRadius="xl"
                                        borderColor="gray.300"
                                        _hover={{ borderColor: 'teal.400' }}
                                        _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                                <FormControl>
                                    <FormLabel color="gray.700" fontWeight="600">Phone Number</FormLabel>
                                    <Input
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="09XX XXX XXXX"
                                        size="lg"
                                        borderRadius="xl"
                                        borderColor="gray.300"
                                        _hover={{ borderColor: 'teal.400' }}
                                        _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel color="gray.700" fontWeight="600">Subject</FormLabel>
                                    <Input
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help you?"
                                        size="lg"
                                        borderRadius="xl"
                                        borderColor="gray.300"
                                        _hover={{ borderColor: 'teal.400' }}
                                        _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <FormControl isRequired mb={6}>
                                <FormLabel color="gray.700" fontWeight="600">Message</FormLabel>
                                <Textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Please share your questions, concerns, or feedback..."
                                    rows={6}
                                    size="lg"
                                    borderRadius="xl"
                                    borderColor="gray.300"
                                    _hover={{ borderColor: 'teal.400' }}
                                    _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)' }}
                                />
                            </FormControl>

                            <Button
                                type="submit"
                                colorScheme="teal"
                                size="lg"
                                w="full"
                                borderRadius="xl"
                                rightIcon={<SendIcon />}
                                isLoading={isSubmitting}
                                loadingText="Sending..."
                                _hover={{
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'xl',
                                }}
                                transition="all 0.2s"
                            >
                                Send Message
                            </Button>
                        </form>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
};

export default ContactForm;
