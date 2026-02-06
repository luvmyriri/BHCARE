import { useState } from 'react';
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
import GoogleMapModal from './GoogleMapModal';

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
    const [isMapOpen, setIsMapOpen] = useState(false);

    return (
        <Box pt={10} pb={32} position="relative" bg="transparent" className="animate-fade-in-up">
            {/* Decorative Background Element */}
            <Box
                position="absolute"
                left="-5%"
                top="10%"
                boxSize="400px"
                bg="teal.100"
                borderRadius="full"
                filter="blur(100px)"
                opacity={0.3}
                zIndex={0}
            />

            <Container maxW="6xl" position="relative" zIndex={1}>
                {/* Section Header */}
                <Flex direction="column" alignItems="center" mb={12} textAlign="center">
                    <Badge colorScheme="purple" px={3} py={1} rounded="full" mb={2}>
                        FACILITY & COMMUNITY
                    </Badge>
                    <Heading
                        as="h2"
                        fontSize={{ base: "3xl", md: "5xl" }}
                        color="teal.900"
                        fontWeight="800"
                        letterSpacing="tight"
                        mb={3}
                    >
                        Hub of Health & Life.
                    </Heading>
                    <Text fontSize="lg" color="gray.600" maxW="2xl">
                        A modern center for medical excellence and vibrant community engagement.
                    </Text>
                </Flex>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center">
                    {/* Unbalanced Masonry Grid (Left Side) */}
                    <Box>
                        <SimpleGrid columns={2} spacing={5}>
                            <Stack spacing={5}>
                                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                                    <Box borderRadius="2xl" overflow="hidden" boxShadow="xl" h="260px" position="relative">
                                        <Image src="/images/OIP (2).webp" w="100%" h="100%" objectFit="cover" />
                                        <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.800 0%, transparent 60%)" />
                                        <Box position="absolute" bottom={4} left={4}>
                                            <Text color="white" fontWeight="bold" fontSize="sm">Community</Text>
                                        </Box>
                                    </Box>
                                </motion.div>
                                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                                    <Box borderRadius="2xl" overflow="hidden" boxShadow="xl" h="180px" position="relative">
                                        <Image src="/images/center_architecture.png" w="100%" h="100%" objectFit="cover" />
                                        <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.800 0%, transparent 60%)" />
                                        <Box position="absolute" bottom={4} left={4}>
                                            <Text color="white" fontWeight="bold" fontSize="sm">Facilities</Text>
                                        </Box>
                                    </Box>
                                </motion.div>
                            </Stack>

                            <Stack spacing={5} mt={12}> {/* Moderate Offset */}
                                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                                    <Box borderRadius="2xl" overflow="hidden" boxShadow="xl" h="200px" position="relative">
                                        <Image src="/images/OIP.webp" w="100%" h="100%" objectFit="cover" />
                                        <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.800 0%, transparent 60%)" />
                                        <Box position="absolute" bottom={4} left={4}>
                                            <Text color="white" fontWeight="bold" fontSize="sm">Partnerships</Text>
                                        </Box>
                                    </Box>
                                </motion.div>
                                <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                                    <Box borderRadius="2xl" overflow="hidden" boxShadow="xl" h="240px" position="relative">
                                        <Image src="/images/OIP (1).webp" w="100%" h="100%" objectFit="cover" />
                                        <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.800 0%, transparent 60%)" />
                                        <Box position="absolute" bottom={4} left={4}>
                                            <Text color="white" fontWeight="bold" fontSize="sm">Technology</Text>
                                        </Box>
                                    </Box>
                                </motion.div>
                            </Stack>
                        </SimpleGrid>
                    </Box>

                    {/* Unified Glass Panel (Right Side) */}
                    <Box>
                        <Box
                            bg="rgba(255, 255, 255, 0.6)"
                            backdropFilter="blur(20px)"
                            borderRadius="3xl"
                            p={8}
                            boxShadow="xl"
                            border="1px solid"
                            borderColor="whiteAlpha.400"
                            position="relative"
                            overflow="hidden"
                        >
                            {/* Decorative element */}
                            <Box position="absolute" top={0} right={0} w="120px" h="120px" bgGradient="radial(teal.100, transparent)" opacity={0.5} />

                            <Stack spacing={6}>
                                {/* Visit Us */}
                                <Flex align="start">
                                    <Box bg="teal.500" p={2} rounded="lg" mr={4} color="white" mt={1}>
                                        <MapPinIcon boxSize={5} />
                                    </Box>
                                    <Box>
                                        <Heading size="md" color="teal.900" mb={1}>Visit Us</Heading>
                                        <Text color="gray.600" fontSize="sm" mb={2}>
                                            Kanlaon St., Camarin, Barangay 174,<br />
                                            Caloocan City, Metro Manila
                                        </Text>
                                        <Button
                                            size="sm"
                                            variant="link"
                                            color="teal.600"
                                            onClick={() => setIsMapOpen(true)}
                                            rightIcon={<Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></Icon>}
                                        >
                                            Get Directions
                                        </Button>
                                    </Box>
                                </Flex>

                                <Box w="full" h="1px" bg="gray.200" />

                                {/* Hours */}
                                <Flex align="start">
                                    <Box bg="orange.400" p={2} rounded="lg" mr={4} color="white" mt={1}>
                                        <ClockIcon boxSize={5} />
                                    </Box>
                                    <Box flex={1}>
                                        <Heading size="md" color="teal.900" mb={1}>Hours</Heading>
                                        <Flex justify="space-between" w="full" maxW="220px" align="center" mb={1}>
                                            <Text color="gray.600" fontSize="sm">Weekdays</Text>
                                            <Text fontWeight="bold" color="teal.800" fontSize="sm">8:00 AM - 5:00 PM</Text>
                                        </Flex>
                                        <Flex justify="space-between" w="full" maxW="220px" align="center">
                                            <Text color="gray.600" fontSize="sm">Emergency</Text>
                                            <Badge colorScheme="red" variant="solid" rounded="full" fontSize="xs">24/7</Badge>
                                        </Flex>
                                    </Box>
                                </Flex>

                                <Box w="full" h="1px" bg="gray.200" />

                                {/* Connect */}
                                <Flex align="center">
                                    <Box bg="blue.500" p={2} rounded="lg" mr={4} color="white">
                                        <PhoneIcon boxSize={5} />
                                    </Box>
                                    <Box>
                                        <Heading size="md" color="teal.900" mb={1}>Connect</Heading>
                                        <Text color="teal.800" fontWeight="bold" fontSize="lg" lineHeight="1">
                                            (02) 8961-1234
                                        </Text>
                                        <Text color="gray.500" fontSize="xs">info@brgy174hc.gov.ph</Text>
                                    </Box>
                                </Flex>
                            </Stack>
                        </Box>
                    </Box>
                </SimpleGrid>
            </Container>



            <GoogleMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
        </Box>
    );
};

export default LocationShowcase;
