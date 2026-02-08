import React from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    Image,
    Stack,
    Text,
    Icon,
    SimpleGrid,
    Badge,
    HStack,
    useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import './Hero.css';

// Illustrations/Icons for Highlights
const DocumentIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </Icon>
);

const CheckCircleIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </Icon>
);

const TrophyIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Icon>
);

const LocationIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </Icon>
);

interface HeroProps {
    onRegisterClick?: () => void;
    onLoginClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onRegisterClick, onLoginClick }) => {
    const { t } = useLanguage();
    // Gradient for the text "KALUSUGAN ANG UNA" (Mint Green -> Light Orange)
    const textGradient = "linear(to-r, teal.400, orange.300)";

    // Responsive values for floating elements with granular control and clamp() for smooth scaling
    const topPerformingTop = useBreakpointValue({ base: '2%', md: '5%', lg: '10%', xl: '15%' });
    const topPerformingRight = useBreakpointValue({ base: '2%', md: '-2%', lg: '-5%', xl: '0%' });

    const readinessTop = useBreakpointValue({ base: '30%', md: '35%', lg: '40%', xl: '45%' });
    const readinessLeft = useBreakpointValue({ base: '2%', md: '-10%', lg: '-15%', xl: '-5%' });

    const digitizedBottom = useBreakpointValue({ base: '2%', md: '5%', lg: '10%', xl: '15%' });
    const digitizedLeft = useBreakpointValue({ base: '2%', md: '-2%', lg: '0%', xl: '10%' });

    return (
        <Box
            bg="transparent"
            minH="100vh"
            overflow="hidden"
            position="relative"
            pt={{ base: '4rem', md: '8rem' }} // Reduced base padding
        >

            <Container maxW="7xl" position="relative" zIndex={1} pt={{ base: '2rem', md: '4rem' }}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 12 }} alignItems="center">

                    {/* Left Content Column */}
                    <Stack spacing={{ base: 6, md: 8 }} textAlign={{ base: 'center', lg: 'left' }}>
                        <Box>
                            <Badge
                                px={5}
                                py={2}
                                rounded="full"
                                bg="teal.50"
                                color="teal.600"
                                border="1px solid"
                                borderColor="teal.100"
                                fontWeight="bold"
                                fontSize="xs"
                                boxShadow="sm"
                                mb={6}
                                display="inline-flex"
                                alignItems="center"
                                gap={2}
                                textTransform="uppercase"
                                letterSpacing="wider"
                            >
                                <LocationIcon boxSize={3} color="orange.400" />
                                Caloocan City Government
                            </Badge>

                            <Heading
                                as="h1"
                                fontSize={{ base: "2rem", md: "3.5rem", lg: "4.5rem", xl: "5rem" }} // Reduced base font size
                                fontWeight="800"
                                lineHeight="1.1"
                                letterSpacing="tight"
                                color="teal.900"
                                mb={6}
                            >
                                <Text as="span" display="block" color="teal.500" fontSize={{ base: "1rem", md: "1.5rem", lg: "1.875rem" }} fontWeight="bold" mb={2} letterSpacing="normal">
                                    {t.heroTitle}
                                </Text>
                                {/* Mint to Orange Gradient Text */}
                                <Text
                                    as="span"
                                    bgGradient={textGradient}
                                    bgClip="text"
                                    display="block"
                                    pb={2}
                                >
                                    KALUSUGAN ANG UNA
                                </Text>
                            </Heading>

                            <Text fontSize={{ base: "1rem", lg: "1.25rem" }} color="gray.600" maxW="lg" mx={{ base: 'auto', lg: 0 }} lineHeight="1.8">
                                {t.heroSubtitle}
                            </Text>
                        </Box>

                        {/* NEW BUTTONS: REGISTER & LOGIN */}
                        <Stack direction={{ base: "column", sm: "row" }} spacing={4} justify={{ base: 'center', lg: 'flex-start' }}>
                            <Button
                                size="lg"
                                rounded="full"
                                bg="orange.400"
                                color="white"
                                px={10}
                                h={16}
                                fontSize="lg"
                                fontWeight="bold"
                                _hover={{ bg: "orange.500", transform: "translateY(-2px)", boxShadow: "xl" }}
                                transition="all 0.2s"
                                onClick={onRegisterClick}
                            >
                                {t.heroRegister}
                            </Button>
                            <Button
                                size="lg"
                                rounded="full"
                                variant="ghost"
                                color="teal.600"
                                px={10}
                                h={16}
                                fontSize="lg"
                                fontWeight="bold"
                                _hover={{ bg: "teal.50", color: "teal.700" }}
                                transition="all 0.2s"
                                onClick={onLoginClick}
                            >
                                {t.heroLogin}
                            </Button>
                        </Stack>
                    </Stack>

                    {/* Right Image Column - Highlighting Achievements */}
                    <Box position="relative" h={{ base: "350px", md: "550px", lg: "650px" }} w="full">

                        {/* Doctor Image */}
                        <Box
                            position="relative"
                            h="100%"
                            w="100%"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            zIndex={1}
                            pl={{ lg: 10 }}
                        >
                            <Image
                                src="/images/Logo.png"
                                alt="Healthcare Logo"
                                objectFit="contain"
                                h={{ base: "85%", md: "90%", lg: "95%" }}
                                w="auto"
                                maxW="full"
                                filter="drop-shadow(0px 20px 40px rgba(0,0,0,0.1))"
                                transform="translateY(0px)"
                            />
                        </Box>

                        {/* POPUP 1: ACHIEVEMENTS (Top Right) */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            style={{ position: 'absolute', top: topPerformingTop, right: topPerformingRight, zIndex: 2 }}
                        >
                            <Box
                                bg="rgba(255, 255, 255, 0.85)"
                                backdropFilter="blur(20px)"
                                border="1px solid rgba(255, 255, 255, 0.6)"
                                p={4}
                                borderRadius="2xl"
                                boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.1)"
                                maxW={{ base: "140px", md: "180px", lg: "200px" }}
                            >
                                <HStack spacing={3} mb={1}>
                                    <Box bg="yellow.100" p={2} borderRadius="full" color="yellow.500">
                                        <TrophyIcon boxSize={4} />
                                    </Box>
                                    <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color="gray.700">Top Performing</Text>
                                </HStack>
                                <Text fontSize={{ base: "10px", md: "xs" }} color="gray.500" pl={1}>
                                    Awarded Best Barangay Health Center 2025
                                </Text>
                            </Box>
                        </motion.div>

                        {/* POPUP 2: READINESS (Left/Middle) */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            style={{ position: 'absolute', top: readinessTop, left: readinessLeft, zIndex: 2 }}
                        >
                            <Box
                                bg="rgba(255, 255, 255, 0.85)"
                                backdropFilter="blur(20px)"
                                border="1px solid rgba(255, 255, 255, 0.6)"
                                p={4}
                                borderRadius="2xl"
                                boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.1)"
                                maxW={{ base: "150px", md: "200px", lg: "220px" }}
                            >
                                <HStack spacing={3} mb={1}>
                                    <Box bg="teal.100" p={2} borderRadius="full" color="teal.500">
                                        <CheckCircleIcon boxSize={4} />
                                    </Box>
                                    <Text fontWeight="bold" fontSize={{ base: "xs", md: "sm" }} color="gray.700">100% Readiness</Text>
                                </HStack>
                                <Text fontSize={{ base: "10px", md: "xs" }} color="gray.500" pl={1}>
                                    Fully equipped for emergency response and maternity care.
                                </Text>
                            </Box>
                        </motion.div>

                        {/* POPUP 3: DOCUMENTATION (Bottom Left) */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            style={{ position: 'absolute', bottom: digitizedBottom, left: digitizedLeft, zIndex: 2 }}
                        >
                            <Box
                                bg="rgba(255, 255, 255, 0.85)"
                                backdropFilter="blur(20px)"
                                border="1px solid rgba(255, 255, 255, 0.8)"
                                p={3}
                                borderRadius="xl"
                                boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.1)"
                                display="flex"
                                alignItems="center"
                                gap={3}
                                maxW={{ base: "160px", md: "auto" }}
                            >
                                <Box bg="blue.50" p={2} borderRadius="lg" color="blue.500">
                                    <DocumentIcon boxSize={5} />
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" fontSize="xs" color="gray.800">Digitized Records</Text>
                                    <Text fontSize="10px" color="gray.500">Paperless System</Text>
                                </Box>
                            </Box>
                        </motion.div>
                    </Box>

                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default Hero;