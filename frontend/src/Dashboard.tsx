import React, { useState } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import {
    Box,
    Flex,
    VStack,
    Icon,
    Text,
    Avatar,
    Heading,
    HStack,
    Divider,
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Progress,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    IconButton,
    SimpleGrid,
} from '@chakra-ui/react';
import {
    FiHome,
    FiCalendar,
    FiUser,
    FiLogOut,
    FiActivity,
    FiFileText,
    FiMenu,
} from 'react-icons/fi';
import Profile from './Profile';
import Appointments from './Appointments';
import AIChatbot from './AIChatbot';
import HealthCalculators from './components/HealthCalculators';

import NotificationBell from './components/NotificationBell';

interface DashboardProps {
    user: any;
    onLogout: () => void;
    onUserUpdated: (user: any) => void;
}

const NavItem = ({ icon, children, active, onClick }: any) => {
    const activeBg = 'orange.500';
    const activeColor = 'white';
    const hoverBg = 'orange.50';
    const color = 'teal.700';

    return (
        <Box
            onClick={onClick}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
            cursor="pointer"
            w="full"
        >
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                transition="all 0.3s"
                bg={active ? activeBg : 'transparent'}
                color={active ? activeColor : color}
                _hover={{
                    bg: active ? activeBg : hoverBg,
                    transform: 'translateX(4px)',
                }}
            >
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="18"
                        as={icon}
                    />
                )}
                <Text fontWeight="600">{children}</Text>
            </Flex>
        </Box>
    );
};

const StatCard = ({ label, value, icon, color, onClick }: any) => (
    <Box
        bg="white"
        p={{ base: 4, md: 6 }}
        borderRadius="2xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
        flex="1"
        cursor={onClick ? "pointer" : "default"}
        onClick={onClick}
        transition="all 0.2s"
        _hover={onClick ? { transform: "translateY(-2px)", boxShadow: "md" } : {}}
    >
        <Flex align="center" justify="space-between">
            <VStack align="start" spacing={1}>
                <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                    {label}
                </Text>
                <Heading size="lg" color="teal.800">
                    {value}
                </Heading>
            </VStack>
            <Box p={3} bg={`${color}.50`} borderRadius="xl">
                <Icon as={icon} color={`${color}.500`} boxSize={6} />
            </Box>
        </Flex>
    </Box>
);

const PageHero = ({ title, description, badge }: any) => (
    <Box
        bg="linear-gradient(135deg, #38b2ac 0%, #ed8936 100%)"
        p={{ base: 6, md: 10 }}
        borderRadius={{ base: "2xl", md: "3xl" }}
        color="white"
        boxShadow="xl"
        position="relative"
        overflow="hidden"
        mb={{ base: 6, md: 8 }}
    >
        <Box position="relative" zIndex={1}>
            <HStack spacing={4} mb={2}>
                <Badge colorScheme="orange" variant="solid" px={3} borderRadius="full" fontSize={{ base: "xs", md: "sm" }}>{badge}</Badge>
                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="600" opacity={0.8}>BHCare Patient Portal</Text>
            </HStack>
            <Heading size={{ base: "lg", md: "xl" }} mb={4} lineHeight="shorter">
                {title}
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} opacity={0.9} maxW="lg">
                {description}
            </Text>
        </Box>
        <Icon
            as={FiActivity}
            position="absolute"
            right={{ base: "-30px", md: "-20px" }}
            bottom={{ base: "-30px", md: "-20px" }}
            boxSize={{ base: "150px", md: "200px" }}
            opacity={0.15}
            transform="rotate(-15deg)"
        />
    </Box>
);

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUserUpdated }) => {
    const { t, language, setLanguage } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
    const { isOpen: isAppointmentsOpen, onOpen: onAppointmentsOpen, onClose: onAppointmentsClose } = useDisclosure();
    const { isOpen: isImageZoomOpen, onOpen: onImageZoomOpen, onClose: onImageZoomClose } = useDisclosure();
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [appointmentView, setAppointmentView] = useState<'book' | 'my-appointments'>('book');

    const handleOpenAppointments = (view: 'book' | 'my-appointments') => {
        setAppointmentView(view);
        onAppointmentsOpen();
    };

    const handleCardClick = (card: string) => {
        setSelectedCard(card);
        onOpen();
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'tl' : 'en');
    };

    const renderModalContent = () => {
        switch (selectedCard) {
            case 'appointments':
                return (
                    <>
                        <ModalHeader>{t.upcomingAppointments}</ModalHeader>
                        <ModalBody>
                            <Box p={4} bg="teal.50" borderRadius="lg" mb={4}>
                                <Text fontWeight="bold" color="teal.800">Next Visit: Feb 24, 2026</Text>
                                <Text fontSize="sm">Reason: Medical Check-up</Text>
                                <Text fontSize="sm">Doctor: Dr. Maria Santos</Text>
                            </Box>
                            <Button size="sm" w="full" colorScheme="teal" onClick={() => setActiveTab('appointments')}>{t.bookNewAppointment}</Button>
                        </ModalBody>
                    </>
                );
            case 'records':
                return (
                    <>
                        <ModalHeader>{t.healthRecords}</ModalHeader>
                        <ModalBody>
                            <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between" p={2} borderBottom="1px solid" borderColor="gray.100">
                                    <Text fontSize="sm" fontWeight="600">Blood Test Results</Text>
                                    <Text fontSize="xs" color="gray.500">Feb 10, 2026</Text>
                                </HStack>
                                <HStack justify="space-between" p={2} borderBottom="1px solid" borderColor="gray.100">
                                    <Text fontSize="sm" fontWeight="600">Urinalysis</Text>
                                    <Text fontSize="xs" color="gray.500">Jan 15, 2026</Text>
                                </HStack>
                                <Button size="sm" variant="link" colorScheme="teal" onClick={() => setActiveTab('records')}>View All Records</Button>
                            </VStack>
                        </ModalBody>
                    </>
                );
            case 'health_score':
                return (
                    <>
                        <ModalHeader>{t.healthScore}</ModalHeader>
                        <ModalBody>
                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold">Body Mass Index (BMI)</Text>
                                    <Progress value={80} size="sm" colorScheme="green" />
                                    <Text fontSize="xs" mt={1}>Normal Range (22.5)</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold">Blood Pressure</Text>
                                    <Progress value={90} size="sm" colorScheme="green" />
                                    <Text fontSize="xs" mt={1}>120/80 mmHg (Good)</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold">Physical Activity</Text>
                                    <Progress value={60} size="sm" colorScheme="orange" />
                                    <Text fontSize="xs" mt={1}>Moderate (Needs Improvement)</Text>
                                </Box>
                            </VStack>
                        </ModalBody>
                    </>
                );
            default:
                return (
                    <>
                        <ModalHeader>Detail View</ModalHeader>
                        <ModalBody><Text>No details available.</Text></ModalBody>
                    </>
                );
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <VStack align="stretch" spacing={8}>
                        <PageHero
                            badge={t.overallHealth.toUpperCase()}
                            title={t.welcomeUser.replace('{name}', user?.first_name || 'Patient')}
                            description={t.healthPriority}
                        />

                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
                            <StatCard label={t.upcomingAppointments} value="1" icon={FiCalendar} color="teal" onClick={() => handleCardClick('appointments')} />
                            <StatCard label={t.healthRecords} value="12" icon={FiFileText} color="orange" onClick={() => handleCardClick('records')} />
                            <StatCard label={t.healthScore} value="98%" icon={FiActivity} color="green" onClick={() => handleCardClick('health_score')} />
                        </SimpleGrid>

                        <Heading size="md" color="teal.800" mt={4}>
                            {t.recentActivity}
                        </Heading>
                        <VStack align="stretch" spacing={4}>
                            <Box p={5} bg="white" borderRadius="xl" boxShadow="xs" border="1px solid" borderColor="gray.50">
                                <HStack justify="space-between">
                                    <HStack spacing={4}>
                                        <Box p={2} bg="teal.50" borderRadius="lg">
                                            <Icon as={FiCalendar} color="teal.500" />
                                        </Box>
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="700">Medical Check-up Booked</Text>
                                            <Text fontSize="sm" color="gray.500">Scheduled for Feb 24, 2026 at 10:00 AM</Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.400">2 hours ago</Text>
                                </HStack>
                            </Box>
                            <Box p={5} bg="white" borderRadius="xl" boxShadow="xs" border="1px solid" borderColor="gray.50">
                                <HStack justify="space-between">
                                    <HStack spacing={4}>
                                        <Box p={2} bg="orange.50" borderRadius="lg">
                                            <Icon as={FiUser} color="orange.500" />
                                        </Box>
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="700">Profile Updated</Text>
                                            <Text fontSize="sm" color="gray.500">Contact information changed</Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.400">Yesterday</Text>
                                </HStack>
                            </Box>
                        </VStack>
                    </VStack>
                );
            case 'appointments':
                return (
                    <>
                        <PageHero
                            badge={t.appointments.toUpperCase()}
                            title={t.bookNewAppointment.split(' ').slice(0, 2).join(' ') + ' & ' + t.appointments}
                            description={t.scheduleConsultation}
                        />
                        <VStack spacing={8} align="stretch">
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <Box
                                    p={8}
                                    bg="white"
                                    borderRadius="2xl"
                                    border="2px solid"
                                    borderColor="teal.200"
                                    cursor="pointer"
                                    transition="all 0.3s"
                                    _hover={{
                                        transform: 'translateY(-4px)',
                                        boxShadow: 'xl',
                                        borderColor: 'teal.400'
                                    }}
                                    onClick={() => handleOpenAppointments('book')}
                                >
                                    <VStack spacing={4} align="start">
                                        <Flex
                                            w="60px"
                                            h="60px"
                                            borderRadius="xl"
                                            bgGradient="linear(to-br, teal.400, teal.600)"
                                            align="center"
                                            justify="center"
                                            fontSize="3xl"
                                            color="white"
                                        >
                                            📅
                                        </Flex>
                                        <Heading size="md" color="teal.800">{t.bookNewAppointment}</Heading>
                                        <Text color="gray.600" fontSize="sm">
                                            {t.scheduleConsultation}
                                        </Text>
                                        <Button
                                            bgGradient="linear(to-r, teal.500, teal.600)"
                                            color="white"
                                            size="md"
                                            fontWeight="700"
                                            borderRadius="lg"
                                            _hover={{
                                                transform: 'translateY(-2px)',
                                                boxShadow: 'lg',
                                                bgGradient: "linear(to-r, teal.600, teal.700)"
                                            }}
                                        >
                                            {t.bookNow} →
                                        </Button>
                                    </VStack>
                                </Box>

                                <Box
                                    p={8}
                                    bg="white"
                                    borderRadius="2xl"
                                    border="2px solid"
                                    borderColor="teal.200"
                                    cursor="pointer"
                                    transition="all 0.3s"
                                    _hover={{
                                        transform: 'translateY(-4px)',
                                        boxShadow: 'xl',
                                        borderColor: 'teal.400'
                                    }}
                                    onClick={() => handleOpenAppointments('my-appointments')}
                                >
                                    <VStack spacing={4} align="start">
                                        <Flex
                                            w="60px"
                                            h="60px"
                                            borderRadius="xl"
                                            bgGradient="linear(to-br, green.400, teal.500)"
                                            align="center"
                                            justify="center"
                                            fontSize="3xl"
                                            color="white"
                                        >
                                            📋
                                        </Flex>
                                        <Heading size="md" color="teal.800">{t.viewMyAppointments}</Heading>
                                        <Text color="gray.600" fontSize="sm">
                                            {t.checkAppointments}
                                        </Text>
                                        <Button
                                            bgGradient="linear(to-r, green.500, teal.500)"
                                            color="white"
                                            size="md"
                                            fontWeight="700"
                                            borderRadius="lg"
                                            _hover={{
                                                transform: 'translateY(-2px)',
                                                boxShadow: 'lg',
                                                bgGradient: "linear(to-r, green.600, teal.600)"
                                            }}
                                        >
                                            {t.viewAppointments} →
                                        </Button>
                                    </VStack>
                                </Box>
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                <Box p={6} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.100">
                                    <HStack spacing={3} mb={2}>
                                        <Text fontSize="2xl">⏰</Text>
                                        <Heading size="sm" color="teal.800">{t.quickEasy}</Heading>
                                    </HStack>
                                    <Text fontSize="sm" color="teal.700">
                                        {t.bookSimple}
                                    </Text>
                                </Box>
                                <Box p={6} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                                    <HStack spacing={3} mb={2}>
                                        <Text fontSize="2xl">🏥</Text>
                                        <Heading size="sm" color="blue.800">{t.multipleServices}</Heading>
                                    </HStack>
                                    <Text fontSize="sm" color="blue.700">
                                        {t.chooseServices}
                                    </Text>
                                </Box>
                                <Box p={6} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.100">
                                    <HStack spacing={3} mb={2}>
                                        <Text fontSize="2xl">📱</Text>
                                        <Heading size="sm" color="green.800">{t.instantConfirmation}</Heading>
                                    </HStack>
                                    <Text fontSize="sm" color="green.800">
                                        {t.getConfirmation}
                                    </Text>
                                </Box>
                            </SimpleGrid>
                        </VStack>
                        <Appointments
                            user={user}
                            onClose={onAppointmentsClose}
                            isOpen={isAppointmentsOpen}
                            initialView={appointmentView}
                        />
                    </>
                );
            case 'profile':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge={t.myProfile.toUpperCase()}
                            title={t.personalInfo}
                            description={t.keepUpdated}
                        />
                        <Profile user={user} onClose={() => setActiveTab('overview')} onUpdated={onUserUpdated} />
                    </VStack>
                );
            case 'records':
                return (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge={t.healthRecords.toUpperCase()}
                            title="Medical Logs & Results"
                            description="Access your past check-ups, diagnostic reports, and medical history in one secure place."
                        />

                        <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
                            <Box flex="2" bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <Heading size="md" color="teal.800" mb={6}>My Medical History</Heading>
                                <Box overflowX="auto">
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Date</Th>
                                                <Th>Diagnosis / Procedure</Th>
                                                <Th>Doctor</Th>
                                                <Th>Status</Th>
                                                <Th>Action</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {[
                                                { date: 'Feb 10, 2026', diag: 'Annual Physical Exam', doc: 'Dr. Santos', status: 'Completed' },
                                                { date: 'Jan 15, 2026', diag: 'Flu Vaccination', doc: 'Dr. Gomez', status: 'Completed' },
                                                { date: 'Dec 05, 2025', diag: 'Dental Cleaning', doc: 'Dr. Reyes', status: 'Completed' },
                                            ].map((r, i) => (
                                                <Tr key={i}>
                                                    <Td>{r.date}</Td>
                                                    <Td fontWeight="600">{r.diag}</Td>
                                                    <Td>{r.doc}</Td>
                                                    <Td><Badge colorScheme="green">{r.status}</Badge></Td>
                                                    <Td>
                                                        <Button size="xs" colorScheme="teal" variant="ghost">View Result</Button>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>

                            <Box flex="1" bg="teal.50" p={6} borderRadius="2xl" border="1px solid" borderColor="teal.100">
                                <VStack align="start" spacing={4}>
                                    <Heading size="md" color="teal.800">Request Documents</Heading>
                                    <Text fontSize="sm" color="teal.700">
                                        Need a medical certificate or health clearance? Request it here and pick it up at the center.
                                    </Text>
                                    <Divider borderColor="teal.200" />
                                    <Button w="full" colorScheme="teal" size="md">
                                        Request Medical Certificate
                                    </Button>
                                    <Button w="full" colorScheme="orange" variant="outline" size="md">
                                        Request Health Clearance
                                    </Button>
                                    <Text fontSize="xs" color="gray.500" mt={2}>
                                        *Processing time: 1-2 working days. You will be notified when it's ready.
                                    </Text>
                                </VStack>
                            </Box>
                        </Flex>
                    </VStack>
                );
            case 'health-tools':
                return (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge={t.healthTools.toUpperCase()}
                            title={t.interactiveCalculators}
                            description={t.monitorHealth}
                        />
                        <HealthCalculators />
                    </VStack>
                );
            default:
                return null;
        }
    };

    return (
        <Box minH="100vh" bg="#f7fafc">
            {/* Sidebar */}
            <Box
                w={{ base: 'full', md: '280px' }}
                pos="fixed"
                h="full"
                bg="white"
                borderRight="1px"
                borderRightColor="gray.200"
                display={{ base: 'none', md: 'block' }}
                boxShadow="sm"
            >
                <Flex h="20" align="center" mx="8" mb={8}>
                    <HStack spacing={3}>
                        <img src="/images/Logo.png" alt="Logo" style={{ height: '32px' }} />
                        <Text fontSize="xl" fontWeight="800" color="teal.800" letterSpacing="tight">
                            BHCare
                        </Text>
                    </HStack>
                </Flex>

                <VStack spacing={2} align="stretch" px={4}>
                    <NavItem icon={FiHome} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                        {t.overallHealth}
                    </NavItem>
                    <NavItem icon={FiCalendar} active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
                        {t.appointments}
                    </NavItem>
                    <NavItem icon={FiFileText} active={activeTab === 'records'} onClick={() => setActiveTab('records')}>
                        {t.healthRecords}
                    </NavItem>
                    <NavItem icon={FiUser} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                        {t.profileSettings}
                    </NavItem>
                    <NavItem icon={FiActivity} active={activeTab === 'health-tools'} onClick={() => setActiveTab('health-tools')}>
                        {t.healthTools}
                    </NavItem>
                </VStack>

                <Box pos="absolute" bottom="8" w="full" px={4}>
                    <Divider mb={4} />
                    <NavItem icon={FiLogOut} onClick={onLogout}>
                        {t.logout}
                    </NavItem>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box ml={{ base: 0, md: '280px' }} p={{ base: 4, sm: 6, md: 8 }} position="relative">
                <Flex
                    justify="space-between"
                    align={{ base: "start", sm: "center" }}
                    mb={{ base: 6, md: 10 }}
                    direction={{ base: "column", sm: "row" }}
                    gap={4}
                >
                    <HStack spacing={4} w="full">
                        <IconButton
                            display={{ base: 'flex', md: 'none' }}
                            onClick={onSidebarOpen}
                            variant="outline"
                            aria-label="open menu"
                            icon={<FiMenu />}
                            size="md"
                        />
                        <VStack align="start" spacing={0}>
                            <Heading size={{ base: "sm", md: "md" }} color="teal.800" textTransform="capitalize">
                                {activeTab.replace('-', ' ')}
                            </Heading>
                            <Text color="gray.400" fontSize={{ base: "xs", md: "sm" }}>
                                Healthcare Dashboard v4.0
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack spacing={3} align={{ base: "start", sm: "center" }} pl={{ base: 12, sm: 0 }} maxW={{ base: "calc(100% - 60px)", sm: "auto" }}>
                        <Button
                            onClick={toggleLanguage}
                            size="sm"
                            variant="outline"
                            colorScheme="teal"
                            leftIcon={<span>{language === 'en' ? '🇺🇸' : '🇵🇭'}</span>}
                            mr={2}
                        >
                            {language === 'en' ? 'EN' : 'TL'}
                        </Button>
                        <NotificationBell userId={user?.id} />
                        <VStack align="end" spacing={0} mr={2} overflow="hidden">
                            <Text
                                fontWeight="700"
                                color="teal.800"
                                fontSize={{ base: "sm", md: "md" }}
                                isTruncated
                                maxW="full"
                            >
                                {user?.first_name} {user?.last_name}
                            </Text>
                            <Badge colorScheme="teal" variant="subtle" fontSize="10px" borderRadius="full" px={2}>
                                Patient
                            </Badge>
                        </VStack>
                        <Avatar
                            size={{ base: "sm", md: "md" }}
                            name={`${user?.first_name} ${user?.last_name}`}
                            src={user?.profile_picture}
                            bg="teal.500"
                            color="white"
                            border="2px solid white"
                            boxShadow="md"
                            flexShrink={0}
                            cursor="pointer"
                            onClick={onImageZoomOpen}
                            _hover={{ transform: 'scale(1.1)', transition: 'transform 0.2s' }}
                            title="Click to zoom"
                        />
                    </HStack>
                </Flex>

                <Box>
                    {renderContent()}
                </Box>
            </Box>

            {/* Image Zoom Modal */}
            <Modal isOpen={isImageZoomOpen} onClose={onImageZoomClose} size="full" isCentered>
                <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(10px)" />
                <ModalContent bg="transparent" boxShadow="none">
                    <ModalCloseButton color="white" size="lg" zIndex={2} />
                    <ModalBody display="flex" alignItems="center" justifyContent="center" p={8}>
                        <Box
                            maxW="90vw"
                            maxH="90vh"
                            position="relative"
                            onClick={onImageZoomClose}
                            cursor="zoom-out"
                        >
                            <img
                                src={user?.profile_picture || "https://bit.ly/broken-link"}
                                alt={`${user?.first_name} ${user?.last_name}`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '90vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                                }}
                            />
                        </Box>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* AI Chatbot */}
            <AIChatbot />

            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedCard && selectedCard.replace('_', ' ').charAt(0).toUpperCase() + selectedCard.replace('_', ' ').slice(1)} Details</ModalHeader>
                    <ModalCloseButton />
                    {renderModalContent()}
                    <ModalFooter>
                        <Button colorScheme="teal" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Drawer isOpen={isSidebarOpen} placement="left" onClose={onSidebarClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerBody p={0}>
                        <Box h="full" bg="white">
                            <Flex h="20" align="center" mx="8" mb={8}>
                                <HStack spacing={3}>
                                    <img src="/images/Logo.png" alt="Logo" style={{ height: '32px' }} />
                                    <Text fontSize="xl" fontWeight="800" color="teal.800" letterSpacing="tight">
                                        BHCare
                                    </Text>
                                </HStack>
                            </Flex>

                            <VStack spacing={2} align="stretch" px={4}>
                                <NavItem icon={FiHome} active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); onSidebarClose(); }}>
                                    {t.overallHealth}
                                </NavItem>
                                <NavItem icon={FiCalendar} active={activeTab === 'appointments'} onClick={() => { setActiveTab('appointments'); onSidebarClose(); }}>
                                    {t.appointments}
                                </NavItem>
                                <NavItem icon={FiFileText} active={activeTab === 'records'} onClick={() => { setActiveTab('records'); onSidebarClose(); }}>
                                    {t.healthRecords}
                                </NavItem>
                                <NavItem icon={FiUser} active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); onSidebarClose(); }}>
                                    {t.profileSettings}
                                </NavItem>
                                <NavItem icon={FiActivity} active={activeTab === 'health-tools'} onClick={() => { setActiveTab('health-tools'); onSidebarClose(); }}>
                                    {t.healthTools}
                                </NavItem>
                            </VStack>

                            <Box pos="absolute" bottom="8" w="full" px={4}>
                                <Divider mb={4} />
                                <NavItem icon={FiLogOut} onClick={onLogout}>
                                    {t.logout}
                                </NavItem>
                            </Box>
                        </Box>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default Dashboard;
