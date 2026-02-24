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
} from '@chakra-ui/react';
import { useLanguage } from '../contexts/LanguageContext';
import './Hero.css';

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



    return (
        <Box
            id="home"
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
                                px={4}
                                py={1.5}
                                rounded="full"
                                bg="teal.50"
                                color="teal.600"
                                border="1px solid"
                                borderColor="teal.100"
                                fontWeight="bold"
                                fontSize={{ base: "10px", md: "xs" }}
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
                                fontSize={{ base: "2.25rem", sm: "2.75rem", md: "3.5rem", lg: "4.5rem", xl: "5rem" }}
                                fontWeight="800"
                                lineHeight="1.1"
                                letterSpacing="tight"
                                color="teal.900"
                                mb={6}
                            >
                                <Text as="span" display="block" color="teal.500" fontSize={{ base: "0.875rem", md: "1.25rem", lg: "1.5rem" }} fontWeight="bold" mb={2} letterSpacing="normal">
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

                            <Text fontSize={{ base: "1rem", lg: "1.25rem" }} color="gray.600" maxW="lg" mx={{ base: 'auto', lg: 0 }} lineHeight="1.8" mb={8}>
                                {t.heroSubtitle}
                            </Text>
                        </Box>

                        {/* NEW BUTTONS: REGISTER & LOGIN */}
                        <Stack direction={{ base: "column", sm: "row" }} spacing={4} justify={{ base: 'center', lg: 'flex-start' }} w={{ base: "full", sm: "auto" }}>
                            <Button
                                size="lg"
                                rounded="full"
                                bg="orange.400"
                                color="white"
                                px={10}
                                h={{ base: 14, md: 16 }}
                                fontSize={{ base: "md", md: "lg" }}
                                fontWeight="bold"
                                _hover={{ bg: "orange.500", transform: "translateY(-2px)", boxShadow: "xl" }}
                                transition="all 0.2s"
                                onClick={onRegisterClick}
                                w={{ base: "full", sm: "auto" }}
                            >
                                {t.heroRegister}
                            </Button>
                            <Button
                                size="lg"
                                rounded="full"
                                variant="ghost"
                                color="teal.600"
                                px={10}
                                h={{ base: 14, md: 16 }}
                                fontSize={{ base: "md", md: "lg" }}
                                fontWeight="bold"
                                _hover={{ bg: "teal.50", color: "teal.700" }}
                                transition="all 0.2s"
                                onClick={onLoginClick}
                                w={{ base: "full", sm: "auto" }}
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




                    </Box>

                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default Hero;