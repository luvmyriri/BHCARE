import React from 'react';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Image,
    Stack,
    Text,
    Icon,
    SimpleGrid,
    Badge,
    HStack,
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

    return (
        <Box
            className="hero-animated-bg"
            minH="100vh"
            overflow="hidden"
            position="relative"
            pt={20}
        >
            {/* Decorative Bubble 1 (Mint - Top Left) */}
            <Box
                className="hero-bubble-1"
                position="absolute"
                top="-10%"
                left="-10%"
                boxSize="800px"
                bg="teal.100"
                opacity="0.4"
                filter="blur(100px)"
                borderRadius="full"
                zIndex="0"
            />

            {/* Decorative Bubble 2 (Orange - Bottom Right) */}
            <Box
                className="hero-bubble-2"
                position="absolute"
                bottom="10%"
                right="-5%"
                boxSize="600px"
                bg="orange.200"
                opacity="0.5"
                filter="blur(90px)"
                borderRadius="full"
                zIndex="0"
            />

            {/* Decorative Bubble 3 (Extra Small - Top Right) */}
            <Box
                className="hero-bubble-3"
                position="absolute"
                top="20%"
                right="10%"
                boxSize="300px"
                bg="blue.100"
                opacity="0.3"
                filter="blur(60px)"
                borderRadius="full"
                zIndex="0"
            />

            {/* Decorative Bubble 4 (Yellow - Bottom Left) */}
            <Box
                className="hero-bubble-2"
                position="absolute"
                bottom="20%"
                left="20%"
                boxSize="400px"
                bg="yellow.100"
                opacity="0.4"
                filter="blur(80px)"
                borderRadius="full"
                zIndex="0"
            />

            <Container maxW="7xl" position="relative" zIndex={1} pt={12}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center">

                    {/* Left Content Column */}
                    <Stack spacing={8} textAlign={{ base: 'center', lg: 'left' }}>
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
                                fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                                fontWeight="800"
                                lineHeight="1.1"
                                letterSpacing="tight"
                                color="teal.900"
                                mb={6}
                            >
                                <Text as="span" display="block" color="teal.500" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" mb={2} letterSpacing="normal">
                                    {t.heroTitle}
                                </Text>
                                {/* Mint to Orange Gradient Text */}
                                <Text
                                    as="span"
                                    bgGradient={textGradient}
                                    bgClip="text"
                                    display="block"
                                    pb={2} // Padding bottom to prevent clipping of descenders
                                >
                                    KALUSUGAN ANG UNA
                                </Text>
                            </Heading>

                            <Text fontSize="xl" color="gray.600" maxW="lg" mx={{ base: 'auto', lg: 0 }} lineHeight="1.8">
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
                    <Box position="relative" h={{ base: "450px", md: "650px" }} w="full">
                        {/* Mint Arch Background */}
                        <Box
                            position="absolute"
                            top="5%"
                            right="5%"
                            bottom="5%"
                            left="15%"
                            bgGradient="linear(to-b, teal.50, white)"
                            borderTopRadius="full"
                            borderBottomRadius="full"
                            border="1px solid"
                            borderColor="white"
                            boxShadow="2xl"
                            zIndex={0}
                        />

                        {/* Doctor Image */}
                        <Box
                            position="relative"
                            h="100%"
                            w="100%"
                            display="flex"
                            justifyContent="center"
                            alignItems="flex-end"
                            zIndex={1}
                            pl={{ lg: 10 }}
                        >
                            <Image
                                src="/images/doctor.png"
                                alt="Barangay Doctor"
                                objectFit="contain"
                                h={{ base: "90%", md: "105%" }}
                                maxW="none"
                                filter="drop-shadow(0px 20px 40px rgba(0,0,0,0.1))"
                            />
                        </Box>

                        {/* POPUP 1: ACHIEVEMENTS (Top Right) */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            style={{ position: 'absolute', top: '15%', right: '0%', zIndex: 2 }}
                        >
                            <Box
                                bg="rgba(255, 255, 255, 0.75)"
                                backdropFilter="blur(20px)"
                                border="1px solid rgba(255, 255, 255, 0.6)"
                                p={4}
                                borderRadius="2xl"
                                boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.1)"
                                maxW="200px"
                            >
                                <HStack spacing={3} mb={1}>
                                    <Box bg="yellow.100" p={2} borderRadius="full" color="yellow.500">
                                        <TrophyIcon boxSize={5} />
                                    </Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.700">Top Performing</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500" pl={1}>
                                    Awarded Best Barangay Health Center 2025
                                </Text>
                            </Box>
                        </motion.div>

                        {/* POPUP 2: READINESS (Left/Middle) */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            style={{ position: 'absolute', top: '40%', left: '-5%', zIndex: 2 }}
                        >
                            <Box
                                bg="rgba(255, 255, 255, 0.75)"
                                backdropFilter="blur(20px)"
                                border="1px solid rgba(255, 255, 255, 0.6)"
                                p={4}
                                borderRadius="2xl"
                                boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.1)"
                                maxW="220px"
                            >
                                <HStack spacing={3} mb={1}>
                                    <Box bg="teal.100" p={2} borderRadius="full" color="teal.500">
                                        <CheckCircleIcon boxSize={5} />
                                    </Box>
                                    <Text fontWeight="bold" fontSize="sm" color="gray.700">100% Readiness</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500" pl={1}>
                                    Fully equipped for emergency response and maternity care.
                                </Text>
                            </Box>
                        </motion.div>

                        {/* POPUP 3: DOCUMENTATION (Bottom Left) */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            style={{ position: 'absolute', bottom: '15%', left: '10%', zIndex: 2 }}
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
