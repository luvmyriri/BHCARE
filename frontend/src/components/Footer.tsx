
import {
    Box,
    Container,
    Stack,
    SimpleGrid,
    Text,
    Link,
    Flex,
    Icon,
    Heading,
    Divider,
} from '@chakra-ui/react';

const FacebookIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </Icon>
);

const TwitterIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </Icon>
);

const EmailIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </Icon>
);

const PhoneIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </Icon>
);

const MapPinIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </Icon>
);

const Footer = ({ onAppointmentClick }: { onAppointmentClick?: () => void }) => {
    const currentYear = new Date().getFullYear();

    return (
        <Box bg="rgba(23, 25, 35, 0.9)" backdropFilter="blur(10px)" color="white" mt="auto">
            <Container maxW="7xl" py={12}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                    {/* About Section */}
                    <Stack spacing={4}>
                        <Flex alignItems="center" gap={2}>
                            <Box bg="teal.500" p={2} borderRadius="lg">
                                <Text fontSize="2xl" fontWeight="bold">🏥</Text>
                            </Box>
                            <Heading size="md" color="white">BHCARE</Heading>
                        </Flex>
                        <Text fontSize="sm" color="gray.400">
                            Barangay 174 Health Center provides quality healthcare services to our community with compassion and excellence.
                        </Text>
                        <Flex gap={3} mt={2}>
                            <Link href="#" _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
                                <Box bg="whiteAlpha.200" p={2} borderRadius="lg" _hover={{ bg: 'whiteAlpha.300' }}>
                                    <FacebookIcon boxSize={5} />
                                </Box>
                            </Link>
                            <Link href="#" _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
                                <Box bg="whiteAlpha.200" p={2} borderRadius="lg" _hover={{ bg: 'whiteAlpha.300' }}>
                                    <TwitterIcon boxSize={5} />
                                </Box>
                            </Link>
                            <Link href="#" _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
                                <Box bg="whiteAlpha.200" p={2} borderRadius="lg" _hover={{ bg: 'whiteAlpha.300' }}>
                                    <EmailIcon boxSize={5} />
                                </Box>
                            </Link>
                        </Flex>
                    </Stack>

                    {/* Quick Links */}
                    <Stack spacing={4}>
                        <Heading size="sm" color="teal.300" mb={2}>Quick Links</Heading>
                        <Link href="#home" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Home</Link>
                        <Link href="#services" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Services</Link>
                        <Link onClick={onAppointmentClick} cursor="pointer" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Appointments</Link>
                        <Link href="#about" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>About Us</Link>
                        <Link href="#contact" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>FAQs</Link>
                    </Stack>

                    {/* Services */}
                    <Stack spacing={4}>
                        <Heading size="sm" color="teal.300" mb={2}>Our Services</Heading>
                        <Link href="#services" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>General Consultation</Link>
                        <Link href="#services" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Vaccination</Link>
                        <Link href="#services" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Prenatal Care</Link>
                        <Link href="#services" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Dental Services</Link>
                        <Link href="#services" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Laboratory</Link>
                    </Stack>

                    {/* Contact Info */}
                    <Stack spacing={4}>
                        <Heading size="sm" color="teal.300" mb={2}>Contact Us</Heading>
                        <Flex alignItems="start" gap={3}>
                            <MapPinIcon boxSize={5} color="teal.400" mt={0.5} flexShrink={0} />
                            <Text fontSize="sm" color="gray.400">
                                Kanlaon St., Camarin<br />
                                Barangay 174, Caloocan City<br />
                                Metro Manila, 1422
                            </Text>
                        </Flex>
                        <Flex alignItems="center" gap={3}>
                            <PhoneIcon boxSize={5} color="teal.400" />
                            <Link href="tel:+6289611234" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>
                                (02) 8961-1234
                            </Link>
                        </Flex>
                        <Flex alignItems="center" gap={3}>
                            <EmailIcon boxSize={5} color="teal.400" />
                            <Link href="mailto:info@brgy174hc.gov.ph" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>
                                info@brgy174hc.gov.ph
                            </Link>
                        </Flex>
                        <Box>
                            <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={1}>
                                Operating Hours:
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                                Mon-Fri: 8:00 AM - 5:00 PM
                            </Text>
                            <Text fontSize="xs" color="teal.400" fontWeight="bold">
                                Emergency: 24/7
                            </Text>
                        </Box>
                    </Stack>
                </SimpleGrid>

                <Divider my={8} borderColor="whiteAlpha.300" />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Text fontSize="sm" color="gray.500">
                        © {currentYear} Barangay 174 Health Center. All rights reserved.
                    </Text>
                    <Flex justifyContent={{ base: 'start', md: 'end' }} gap={6}>
                        <Link href="#" fontSize="sm" color="gray.500" _hover={{ color: 'white' }}>
                            Privacy Policy
                        </Link>
                        <Link href="#" fontSize="sm" color="gray.500" _hover={{ color: 'white' }}>
                            Terms of Service
                        </Link>
                        <Link
                            href="https://caloocancity.gov.ph/city-health-department/"
                            target="_blank"
                            rel="noopener noreferrer"
                            fontSize="sm"
                            color="gray.500"
                            _hover={{ color: 'teal.400' }}
                        >
                            Caloocan CHD
                        </Link>
                    </Flex>
                </SimpleGrid>

                {/* Partnership Badge */}
                <Flex justifyContent="center" mt={8}>
                    <Box
                        px={6}
                        py={3}
                        bg="whiteAlpha.100"
                        borderRadius="full"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                    >
                        <Text fontSize="xs" color="gray.400" textAlign="center">
                            In partnership with{' '}
                            <Link
                                href="https://caloocancity.gov.ph"
                                color="teal.400"
                                fontWeight="bold"
                                _hover={{ color: 'teal.300' }}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Caloocan City Government
                            </Link>
                        </Text>
                    </Box>
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;
