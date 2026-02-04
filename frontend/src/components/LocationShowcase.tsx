import React from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    SimpleGrid,
    Image,
    Stack,
    Icon,
    Flex,
    Button,
    Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MapPinIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </Icon>
);

const ClockIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </Icon>
);

const PhoneIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </Icon>
);

const LocationShowcase = () => {
    return (
        <Box py={20} position="relative" bgGradient="linear(to-b, #fffaf0 0%, white 100%)">
            {/* Decorative Background Element */}
            <Box
                position="absolute"
                left="-5%"
                top="20%"
                boxSize="400px"
                bg="teal.50"
                borderRadius="full"
                filter="blur(80px)"
                zIndex={0}
            />

            <Container maxW="7xl" position="relative" zIndex={1}>
                {/* Section Header */}
                <Flex direction="column" alignItems="center" mb={16} textAlign="center">
                    <Badge colorScheme="orange" px={3} py={1} rounded="full" mb={4}>
                        OUR FACILITY
                    </Badge>
                    <Heading
                        as="h2"
                        fontSize={{ base: "3xl", md: "5xl" }}
                        color="teal.900"
                        fontWeight="800"
                        letterSpacing="tight"
                        mb={4}
                    >
                        Modern. Accessible. Community-Centered.
                    </Heading>
                    <Text fontSize="lg" color="gray.500" maxW="2xl">
                        Located at the heart of Barangay 174, our newly renovated center is designed to provide a comfortable and welcoming environment for all patients.
                    </Text>
                </Flex>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center">
                    {/* Architectural Image Card */}
                    <Box position="relative">
                        <Box
                            bg="white"
                            p={2}
                            borderRadius="3xl"
                            boxShadow="2xl"
                            position="relative"
                            zIndex={2}
                        >
                            <Image
                                src="/images/center_architecture.png"
                                alt="Brgy 174 Health Center Architecture"
                                borderRadius="2xl"
                                objectFit="cover"
                                w="100%"
                                h={{ base: "300px", md: "450px" }}
                            />

                            {/* Floating "Live Status" Pill */}
                            <Box
                                position="absolute"
                                top={6}
                                left={6}
                                bg="rgba(255, 255, 255, 0.9)"
                                backdropFilter="blur(10px)"
                                px={4}
                                py={2}
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                gap={2}
                                boxShadow="md"
                            >
                                <Box w="8px" h="8px" bg="green.400" borderRadius="full" className="animate-pulse" />
                                <Text fontSize="xs" fontWeight="bold" color="teal.800">OPEN NOW</Text>
                            </Box>
                        </Box>

                        {/* Background Decor Behind Image */}
                        <Box
                            position="absolute"
                            top="5%"
                            right="-5%"
                            w="100%"
                            h="100%"
                            bg="orange.100"
                            borderRadius="3xl"
                            zIndex={1}
                            transform="rotate(3deg)"
                        />
                    </Box>

                    {/* Info / Map Card Section */}
                    <Stack spacing={6} pl={{ lg: 10 }}>
                        {/* Address Card */}
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                            <Box
                                bg="white"
                                p={6}
                                borderRadius="2xl"
                                boxShadow="lg"
                                border="1px solid"
                                borderColor="gray.100"
                                position="relative"
                                overflow="hidden"
                            >
                                <Box position="absolute" right={-4} top={-4} bg="teal.50" boxSize="80px" borderRadius="full" />
                                <Flex alignItems="center" gap={4} position="relative">
                                    <Box bg="teal.500" p={3} borderRadius="xl" color="white">
                                        <MapPinIcon boxSize={6} />
                                    </Box>
                                    <Box>
                                        <Heading size="md" color="teal.900" mb={1}>Main Location</Heading>
                                        <Text color="gray.600" fontSize="sm">
                                            Kanlaon St., Camarin, Barangay 174<br />
                                            Caloocan City, Metro Manila
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                        </motion.div>

                        {/* Hours Card */}
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                            <Box
                                bg="white"
                                p={6}
                                borderRadius="2xl"
                                boxShadow="lg"
                                border="1px solid"
                                borderColor="gray.100"
                                position="relative"
                            >
                                <Flex alignItems="center" gap={4}>
                                    <Box bg="orange.400" p={3} borderRadius="xl" color="white">
                                        <ClockIcon boxSize={6} />
                                    </Box>
                                    <Box>
                                        <Heading size="md" color="teal.900" mb={1}>Operating Hours</Heading>
                                        <Text color="gray.600" fontSize="sm">
                                            Monday - Friday: 8:00 AM - 5:00 PM<br />
                                            <Text as="span" color="orange.500" fontWeight="bold">Emergency: 24/7</Text>
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                        </motion.div>

                        {/* Contact Card */}
                        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                            <Box
                                bg="white"
                                p={6}
                                borderRadius="2xl"
                                boxShadow="lg"
                                border="1px solid"
                                borderColor="gray.100"
                                position="relative"
                            >
                                <Flex alignItems="center" gap={4}>
                                    <Box bg="blue.500" p={3} borderRadius="xl" color="white">
                                        <PhoneIcon boxSize={6} />
                                    </Box>
                                    <Box>
                                        <Heading size="md" color="teal.900" mb={1}>Contact Us</Heading>
                                        <Text color="gray.600" fontSize="sm">
                                            (02) 8961-1234<br />
                                            info@brgy174hc.gov.ph
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                        </motion.div>

                        <Button
                            size="lg"
                            variant="link"
                            color="teal.600"
                            alignSelf="start"
                            mt={4}
                            rightIcon={<Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></Icon>}
                        >
                            View on Google Maps
                        </Button>
                    </Stack>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default LocationShowcase;
