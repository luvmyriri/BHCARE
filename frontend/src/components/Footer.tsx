
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
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
    Button
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
    const { isOpen: isPrivacyOpen, onOpen: onPrivacyOpen, onClose: onPrivacyClose } = useDisclosure();
    const { isOpen: isTermsOpen, onOpen: onTermsOpen, onClose: onTermsClose } = useDisclosure();

    return (
        <Box bg="rgba(23, 25, 35, 0.9)" backdropFilter="blur(10px)" color="white" mt="auto">
            <Container maxW="7xl" py={12}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                    {/* About Section */}
                    <Stack spacing={4}>
                        <Flex alignItems="center" gap={3}>
                            <Image src="/images/Logo.png" h="40px" fallbackSrc="https://via.placeholder.com/40/20c997/ffffff?text=B" />
                            <Heading size="md" color="white">BHCare Brgy. 174</Heading>
                        </Flex>
                        <Text fontSize="sm" color="gray.400">
                            Barangay 174 Health Center provides quality healthcare services to our community with compassion and excellence.
                        </Text>
                        <Flex gap={3} mt={2}>
                            <Link href="https://www.facebook.com/profile.php?id=100066788617992" target="_blank" rel="noopener noreferrer" _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
                                <Box bg="whiteAlpha.200" p={2} borderRadius="lg" _hover={{ bg: 'whiteAlpha.300' }}>
                                    <FacebookIcon boxSize={5} />
                                </Box>
                            </Link>
                            <Link href="https://twitter.com/CaloocanCityGov" target="_blank" rel="noopener noreferrer" _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
                                <Box bg="whiteAlpha.200" p={2} borderRadius="lg" _hover={{ bg: 'whiteAlpha.300' }}>
                                    <TwitterIcon boxSize={5} />
                                </Box>
                            </Link>
                            <Link href="mailto:bhcarehealthcenter@gmail.com" _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
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
                        <Link onClick={onAppointmentClick} cursor="pointer" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Consultation</Link>
                        <Link onClick={onAppointmentClick} cursor="pointer" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Prenatal Check Up</Link>
                        <Link onClick={onAppointmentClick} cursor="pointer" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Vaccination (Bakuna)</Link>
                        <Link onClick={onAppointmentClick} cursor="pointer" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Dental Services</Link>
                        <Link onClick={onAppointmentClick} cursor="pointer" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Family Planning</Link>
                        <Link onClick={onAppointmentClick} cursor="pointer" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Dots Center</Link>
                        <Link onClick={onAppointmentClick} cursor="pointer" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Cervical Screening</Link>
                        <Link onClick={onAppointmentClick} cursor="pointer" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Nutrition Counseling</Link>
                    </Stack>

                    {/* Contact Info */}
                    <Stack spacing={4}>
                        <Heading size="sm" color="teal.300" mb={2}>Contact Us</Heading>
                        <Flex alignItems="start" gap={3}>
                            <MapPinIcon boxSize={5} color="teal.400" mt={0.5} flexShrink={0} />
                            <Text fontSize="sm" color="gray.400">
                                Camarin 174 Health Center<br />
                                Cadena De Amor, Caloocan<br />
                                Philippines, 1400
                            </Text>
                        </Flex>
                        <Flex alignItems="center" gap={3}>
                            <PhoneIcon boxSize={5} color="teal.400" />
                            <Link href="tel:0288825664" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>
                                (02) 888-25664
                            </Link>
                        </Flex>
                        <Flex alignItems="center" gap={3}>
                            <EmailIcon boxSize={5} color="teal.400" />
                            <Link href="mailto:bhcarehealthcenter@gmail.com" fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>
                                bhcarehealthcenter@gmail.com
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
                        <Link onClick={onPrivacyOpen} cursor="pointer" fontSize="sm" color="gray.500" _hover={{ color: 'white' }}>
                            Privacy Policy
                        </Link>
                        <Link onClick={onTermsOpen} cursor="pointer" fontSize="sm" color="gray.500" _hover={{ color: 'white' }}>
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

            {/* Privacy Policy Modal */}
            <Modal isOpen={isPrivacyOpen} onClose={onPrivacyClose} size="xl" scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
                <ModalContent borderRadius="xl" bg="white" color="gray.800">
                    <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={4}>
                        <Heading size="md" color="teal.600">Privacy Policy</Heading>
                    </ModalHeader>
                    <ModalCloseButton mt={2} />
                    <ModalBody py={6}>
                        <Stack spacing={4}>
                            <Text fontWeight="bold">1. Information Collection</Text>
                            <Text fontSize="sm">
                                We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise when you contact us. The personal information that we collect depends on the context of your interactions with us and the website, the choices you make and the products and features you use.
                            </Text>

                            <Text fontWeight="bold" mt={4}>2. How We Use Your Information</Text>
                            <Text fontSize="sm">
                                We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, compliance with our legal obligations, and/or your consent. Specifically, we use the information we collect or receive to facilitate account creation and logon processes, send administrative information to you, fulfill and manage your orders or appointments, and to post testimonials.
                            </Text>

                            <Text fontWeight="bold" mt={4}>3. Patient Confidentiality</Text>
                            <Text fontSize="sm">
                                As a healthcare provider, we strictly adhere to medical confidentiality standards and relevant data privacy laws in the Philippines (Data Privacy Act of 2012). Your health records, consultation notes, and all related medical data are stored securely and only accessible by authorized medical personnel directly involved in your care.
                            </Text>

                            <Text fontWeight="bold" mt={4}>4. Information Sharing</Text>
                            <Text fontSize="sm">
                                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may share your data with third-party vendors, service providers, contractors or agents who perform services for us or on our behalf and require access to such information to do that work.
                            </Text>

                            <Text fontWeight="bold" mt={4}>5. Data Retention</Text>
                            <Text fontSize="sm">
                                We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).
                            </Text>
                        </Stack>
                    </ModalBody>
                    <Divider borderColor="gray.100" />
                    <Flex justify="flex-end" p={4} bg="gray.50" borderBottomRadius="xl">
                        <Button colorScheme="teal" onClick={onPrivacyClose} size="md">Acknowledge</Button>
                    </Flex>
                </ModalContent>
            </Modal>

            {/* Terms of Service Modal */}
            <Modal isOpen={isTermsOpen} onClose={onTermsClose} size="xl" scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
                <ModalContent borderRadius="xl" bg="white" color="gray.800">
                    <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={4}>
                        <Heading size="md" color="teal.600">Terms of Service</Heading>
                    </ModalHeader>
                    <ModalCloseButton mt={2} />
                    <ModalBody py={6}>
                        <Stack spacing={4}>
                            <Text fontWeight="bold">1. Agreement to Terms</Text>
                            <Text fontSize="sm">
                                By accessing our website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using this site and our digital services.
                            </Text>

                            <Text fontWeight="bold" mt={4}>2. Use License</Text>
                            <Text fontSize="sm">
                                Permission is granted to temporarily download one copy of the materials (information or software) on BHCare Brgy. 174's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                                <br />• modify or copy the materials;
                                <br />• use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
                                <br />• attempt to decompile or reverse engineer any software contained on BHCare Brgy. 174's website;
                                <br />• remove any copyright or other proprietary notations from the materials; or
                                <br />• transfer the materials to another person or "mirror" the materials on any other server.
                            </Text>

                            <Text fontWeight="bold" mt={4}>3. Medical Disclaimer</Text>
                            <Text fontSize="sm">
                                The content provided on BHCare Brgy. 174's website is for informational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Do not disregard professional medical advice or delay in seeking it because of something you have read on our digital platforms.
                            </Text>

                            <Text fontWeight="bold" mt={4}>4. Appointments and Cancellations</Text>
                            <Text fontSize="sm">
                                By booking an appointment through our system, you commit to arriving at the scheduled time. If you need to cancel or reschedule, you must do so at least 24 hours in advance.
                            </Text>

                            <Text fontWeight="bold" mt={4}>5. Limitations of Liability</Text>
                            <Text fontSize="sm">
                                In no event shall BHCare Brgy. 174 or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we have been notified orally or in writing of the possibility of such damage.
                            </Text>
                        </Stack>
                    </ModalBody>
                    <Divider borderColor="gray.100" />
                    <Flex justify="flex-end" p={4} bg="gray.50" borderBottomRadius="xl">
                        <Button colorScheme="teal" onClick={onTermsClose} size="md">I Agree</Button>
                    </Flex>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Footer;
