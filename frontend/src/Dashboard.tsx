import React, { useState } from 'react';
import {
    Box,
    Flex,
    VStack,
    Icon,
    Text,
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
    Textarea,
    Checkbox,
    FormControl,
    FormLabel,
    Input,
    SimpleGrid,
    useToast,
    Avatar,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    IconButton,
} from '@chakra-ui/react';
import {
    FiHome,
    FiCalendar,
    FiActivity,
    FiFileText,
    FiLogOut,
    FiUser,
    FiMenu
} from 'react-icons/fi';
import { useLanguage } from './contexts/LanguageContext';
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
        p={{ base: 6, md: 8 }}
        borderRadius="3xl"
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
        p={{ base: 8, md: 12 }}
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
    const { isOpen: isDocReqModalOpen, onOpen: onDocReqModalOpen, onClose: onDocReqModalClose } = useDisclosure();
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [appointmentView, setAppointmentView] = useState<'book' | 'my-appointments'>('book');
    const toast = useToast();

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

    const [appointments, setAppointments] = useState<any[]>([]);
    const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
    const [documentHistory, setDocumentHistory] = useState<any[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [docReqType, setDocReqType] = useState('');
    const [docReqReason, setDocReqReason] = useState('');
    const [docReqSickness, setDocReqSickness] = useState('');
    const [docReqConsult, setDocReqConsult] = useState(false);
    const [isDocReqSubmitting, setIsDocReqSubmitting] = useState(false);

    const onDocReqClose = () => {
        onDocReqModalClose();
        setDocReqReason('');
        setDocReqSickness('');
        setDocReqConsult(false);
    };

    const handleOpenDocReqModal = (type: string) => {
        setDocReqType(type);
        onDocReqModalOpen();
    };

    React.useEffect(() => {
        if (user?.id) {
            fetch(`/api/appointments?user_id=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    // Filter for upcoming appointments only
                    const upcoming = data.filter((appt: any) => new Date(appt.date) >= new Date() && appt.status !== 'Cancelled').sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setAppointments(upcoming);
                })
                .catch(err => console.error(err));

            fetch(`/api/patients/${user.id}/history`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setMedicalHistory(data);
                    }
                })
                .catch(err => console.error(err));

            fetch(`/api/documents/user/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setDocumentHistory(data);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [user?.id]);

    const handleSubmitDocRequest = async () => {
        if (!docReqReason.trim()) {
            toast({
                title: "Reason Required",
                description: "Please provide a reason for your document request.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsDocReqSubmitting(true);
        try {
            const res = await fetch('/api/documents/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.id,
                    document_type: docReqType,
                    reason: docReqReason,
                    sickness: docReqSickness,
                    consultation_acknowledged: docReqConsult
                }),
            });

            if (res.ok) {
                toast({
                    title: "Request Submitted",
                    description: `Your request for a ${docReqType} has been successfully submitted.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                // Refresh document history
                fetch(`/api/documents/user/${user.id}`)
                    .then(r => r.json())
                    .then(d => { if (Array.isArray(d)) setDocumentHistory(d); })
                    .catch(e => console.error(e));

                onDocReqClose();
            } else {
                toast({
                    title: "Request Failed",
                    description: "There was an error submitting your request. Please try again later.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error requesting document:", error);
            toast({
                title: "Error",
                description: "A network error occurred.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsDocReqSubmitting(false);
        }
    };

    const nextAppointment = appointments.length > 0 ? appointments[0] : null;

    const renderModalContent = () => {
        switch (selectedCard) {
            case 'appointments':
                return (
                    <>
                        <ModalHeader>{t.upcomingAppointments}</ModalHeader>
                        <ModalBody>
                            {nextAppointment ? (
                                <Box p={4} bg="teal.50" borderRadius="lg" mb={4}>
                                    <Text fontWeight="bold" color="teal.800">Next Visit: {new Date(nextAppointment.date).toLocaleDateString()}</Text>
                                    <Text fontSize="sm">Reason: {nextAppointment.service_type || 'Medical Check-up'}</Text>
                                    <Text fontSize="sm">Doctor: {nextAppointment.doctor_name || 'Dr. Maria Santos'}</Text>
                                    <Text fontSize="sm" color="teal.600" mt={1}>{nextAppointment.time}</Text>
                                </Box>
                            ) : (
                                <Box p={4} bg="gray.50" borderRadius="lg" mb={4} textAlign="center">
                                    <Text color="gray.500">No upcoming appointments.</Text>
                                </Box>
                            )}
                            <Button size="sm" w="full" colorScheme="teal" onClick={() => { setActiveTab('appointments'); onClose(); handleOpenAppointments('book'); }}>{t.bookNewAppointment}</Button>
                        </ModalBody>
                    </>
                );
            case 'records':
                return (
                    <>
                        <ModalHeader>{t.healthRecords}</ModalHeader>
                        <ModalBody>
                            <VStack align="stretch" spacing={2}>
                                {medicalHistory.length > 0 ? medicalHistory.slice(0, 3).map((record, index) => (
                                    <HStack key={index} justify="space-between" p={2} borderBottom="1px solid" borderColor="gray.100">
                                        <Text fontSize="sm" fontWeight="600">{record.assessment || 'Medical Log'}</Text>
                                        <Text fontSize="xs" color="gray.500">{record.created_at}</Text>
                                    </HStack>
                                )) : (
                                    <Text fontSize="sm" color="gray.500">No medical records found.</Text>
                                )}
                                <Button size="sm" variant="link" colorScheme="teal" onClick={() => { setActiveTab('records'); onClose(); }}>View All Records</Button>
                            </VStack>
                        </ModalBody>
                    </>
                );
            case 'record_detail':
                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <HStack align="center" spacing={3}>
                                <Icon as={FiFileText} boxSize={6} />
                                <Text>Medical Record Detail</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            {selectedRecord ? (
                                <VStack align="stretch" spacing={5}>
                                    <Box p={5} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                                        <SimpleGrid columns={2} spacing={4}>
                                            <Box>
                                                <Text fontWeight="800" fontSize="xs" color="blue.800" textTransform="uppercase">Date Recorded</Text>
                                                <Text fontSize="md" color="blue.900" fontWeight="600">{selectedRecord.created_at}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="800" fontSize="xs" color="blue.800" textTransform="uppercase">Attending Doctor</Text>
                                                <Text fontSize="md" color="blue.900" fontWeight="600">{selectedRecord.doctor_name || 'Medical Officer'}</Text>
                                            </Box>
                                        </SimpleGrid>
                                    </Box>

                                    <Box p={5} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                        <VStack align="stretch" spacing={4}>
                                            <Box borderLeft="3px solid" borderColor="purple.400" pl={4}>
                                                <Text fontWeight="800" fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>Assessment (Diagnosis)</Text>
                                                <Text fontSize="md" color="gray.800">{selectedRecord.assessment || 'None specified'}</Text>
                                            </Box>
                                            {selectedRecord.subjective && (
                                                <Box borderLeft="3px solid" borderColor="blue.400" pl={4}>
                                                    <Text fontWeight="800" fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>Subjective (Symptoms)</Text>
                                                    <Text fontSize="md" color="gray.800">{selectedRecord.subjective}</Text>
                                                </Box>
                                            )}
                                            {selectedRecord.objective && (
                                                <Box borderLeft="3px solid" borderColor="green.400" pl={4}>
                                                    <Text fontWeight="800" fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>Objective (Findings)</Text>
                                                    <Text fontSize="md" color="gray.800">{selectedRecord.objective}</Text>
                                                </Box>
                                            )}
                                            {selectedRecord.plan && (
                                                <Box borderLeft="3px solid" borderColor="orange.400" pl={4}>
                                                    <Text fontWeight="800" fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>Plan (Treatment)</Text>
                                                    <Text fontSize="md" color="gray.800">{selectedRecord.plan}</Text>
                                                </Box>
                                            )}
                                            {(() => {
                                                let meds = [];
                                                try {
                                                    meds = typeof selectedRecord.prescription === 'string' ? JSON.parse(selectedRecord.prescription) : selectedRecord.prescription;
                                                } catch (e) { }

                                                if (meds && Array.isArray(meds) && meds.length > 0) {
                                                    return (
                                                        <Box borderLeft="3px solid" borderColor="teal.400" pl={4} bg="teal.50" p={3} borderRadius="md" mt={2}>
                                                            <Text fontWeight="800" fontSize="xs" color="teal.700" textTransform="uppercase" mb={2}>Dispensed Medicine(s)</Text>
                                                            <VStack align="start" spacing={1}>
                                                                {meds.map((med: any, i: number) => (
                                                                    <HStack key={i} fontSize="sm">
                                                                        <Icon as={FiFileText} color="teal.500" />
                                                                        <Text fontWeight="700" color="teal.800">{med.item_name}</Text>
                                                                        <Text color="gray.600">x{med.quantity}</Text>
                                                                        {med.instructions && <Text color="gray.600" fontStyle="italic">- {med.instructions}</Text>}
                                                                    </HStack>
                                                                ))}
                                                            </VStack>
                                                        </Box>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </VStack>
                                    </Box>
                                </VStack>
                            ) : (
                                <Box py={10} textAlign="center">
                                    <VStack color="gray.400" spacing={3}>
                                        <Icon as={FiFileText} boxSize={12} color="gray.300" />
                                        <Text fontSize="md" fontWeight="500">No record details available.</Text>
                                    </VStack>
                                </Box>
                            )}
                        </ModalBody>
                        <ModalFooter bg="gray.50" borderTopWidth="1px">
                            <Button colorScheme="teal" mr={3} onClick={onClose} _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}>
                                Close
                            </Button>
                        </ModalFooter>
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
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge={t.overallHealth.toUpperCase()}
                            title={t.welcomeUser.replace('{name}', user?.first_name || 'Patient')}
                            description={t.healthPriority}
                        />

                        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={8}>
                            <StatCard label={t.upcomingAppointments} value={appointments.length.toString()} icon={FiCalendar} color="teal" onClick={() => handleCardClick('appointments')} />
                            <StatCard label={t.healthRecords} value={medicalHistory.length.toString()} icon={FiFileText} color="orange" onClick={() => handleCardClick('records')} />
                        </SimpleGrid>

                        <Heading size="md" color="teal.800" mt={4}>
                            {t.recentActivity}
                        </Heading>
                        <VStack align="stretch" spacing={4}>
                            {appointments.length > 0 ? (
                                <Box p={5} bg="white" borderRadius="xl" boxShadow="xs" border="1px solid" borderColor="gray.50">
                                    <HStack justify="space-between">
                                        <HStack spacing={4}>
                                            <Box p={2} bg="teal.50" borderRadius="lg">
                                                <Icon as={FiCalendar} color="teal.500" />
                                            </Box>
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="700">Appointment Scheduled</Text>
                                                <Text fontSize="sm" color="gray.500">{nextAppointment.service_type || 'Medical Check-up'} on {new Date(nextAppointment.date).toLocaleDateString()} at {nextAppointment.time}</Text>
                                            </VStack>
                                        </HStack>
                                        <Text fontSize="sm" color="gray.400">Upcoming</Text>
                                    </HStack>
                                </Box>
                            ) : (
                                <Box p={5} bg="white" borderRadius="xl" boxShadow="xs" border="1px solid" borderColor="gray.50">
                                    <Text color="gray.500" fontStyle="italic">No recent activity.</Text>
                                </Box>
                            )}
                            <Box p={5} bg="white" borderRadius="xl" boxShadow="xs" border="1px solid" borderColor="gray.50">
                                <HStack justify="space-between">
                                    <HStack spacing={4}>
                                        <Box p={2} bg="orange.50" borderRadius="lg">
                                            <Icon as={FiFileText} color="orange.500" />
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
                        <VStack spacing={10} align="stretch">
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                                <Box
                                    p={10}
                                    bg="white"
                                    borderRadius="3xl"
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
                                    p={10}
                                    bg="white"
                                    borderRadius="3xl"
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

                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
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
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge={t.healthRecords.toUpperCase()}
                            title="Medical Logs & Results"
                            description="Access your past check-ups, diagnostic reports, and medical history in one secure place."
                        />

                        <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
                            <Box flex="2" bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
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
                                            {medicalHistory.length > 0 ? (
                                                medicalHistory.map((r, i) => (
                                                    <Tr key={i}>
                                                        <Td whiteSpace="nowrap">{r.created_at}</Td>
                                                        <Td fontWeight="600">{r.assessment || 'Medical Log'}</Td>
                                                        <Td>{r.doctor_name || 'Unknown'}</Td>
                                                        <Td><Badge colorScheme="green">Completed</Badge></Td>
                                                        <Td>
                                                            <Button size="xs" colorScheme="teal" variant="ghost" onClick={() => { setSelectedRecord(r); setSelectedCard('record_detail'); onOpen(); }}>View Result</Button>
                                                        </Td>
                                                    </Tr>
                                                ))
                                            ) : (
                                                <Tr>
                                                    <Td colSpan={5} textAlign="center">
                                                        <Text color="gray.500" py={4}>No medical records found.</Text>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>

                            {/* Document Request History */}
                            <Box flex="1" bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <Heading size="md" color="teal.800" mb={6}>My Document Requests</Heading>
                                <Box overflowX="auto">
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Date</Th>
                                                <Th>Document Type</Th>
                                                <Th>Purpose</Th>
                                                <Th>Status</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {documentHistory.length > 0 ? (
                                                documentHistory.map((doc, i) => (
                                                    <Tr key={i}>
                                                        <Td whiteSpace="nowrap">{doc.created_at}</Td>
                                                        <Td fontWeight="600">{doc.document_type}</Td>
                                                        <Td>
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm">{doc.reason}</Text>
                                                                <Text fontSize="xs" color="gray.500">{doc.sickness}</Text>
                                                            </VStack>
                                                        </Td>
                                                        <Td>
                                                            <Badge colorScheme={doc.status === 'completed' ? 'green' : 'orange'}>
                                                                {doc.status.toUpperCase()}
                                                            </Badge>
                                                        </Td>
                                                    </Tr>
                                                ))
                                            ) : (
                                                <Tr>
                                                    <Td colSpan={4} textAlign="center">
                                                        <Text color="gray.500" py={4}>No document requests found.</Text>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                                <Box bg="teal.50" p={8} borderRadius="3xl" border="1px solid" borderColor="teal.100" mt={6}>
                                    <VStack align="start" spacing={4}>
                                        <Heading size="md" color="teal.800">Request Documents</Heading>
                                        <Text fontSize="sm" color="teal.700">
                                            Need a medical certificate or health clearance? Request it here and pick it up at the center.
                                        </Text>
                                        <Divider borderColor="teal.200" />
                                        <Button w="full" colorScheme="teal" size="md" onClick={() => handleOpenDocReqModal('Medical Certificate')}>
                                            Request Medical Certificate
                                        </Button>
                                        <Button w="full" colorScheme="orange" variant="outline" size="md" onClick={() => handleOpenDocReqModal('Health Clearance')}>
                                            Request Health Clearance
                                        </Button>
                                        <Text fontSize="xs" color="gray.500" mt={2}>
                                            *Processing time: 1-2 working days. You will be notified when it's ready.
                                        </Text>
                                    </VStack>
                                </Box>
                            </Box>
                        </Flex>
                    </VStack >
                );
            case 'health-tools':
                return (
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge={t.healthTools.toUpperCase()}
                            title={t.interactiveCalculators}
                            description={t.monitorHealth}
                        />
                        <HealthCalculators user={user} />
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
            <Box ml={{ base: 0, md: '280px' }} p={{ base: 6, sm: 8, md: 10 }} position="relative">
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
                                Patient Dashboard
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

            {/* Document Request Modal */}
            <Modal isOpen={isDocReqModalOpen} onClose={onDocReqClose} size="xl" isCentered>
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                        Request {docReqType}
                    </ModalHeader>
                    <ModalCloseButton mt={2} />
                    <ModalBody py={6}>
                        <VStack spacing={6} align="stretch">
                            {/* Instructional Box */}
                            <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100">
                                <Heading size="sm" color="blue.800" mb={3}>Instructions & Requirements</Heading>
                                <VStack align="start" spacing={3} fontSize="sm" color="blue.900">
                                    <Text><b>1. Choose a Service:</b> Select an online platform that offers medical certificates.</Text>
                                    <Text><b>2. Fill Out the Application:</b> Complete the patient form with the accurate details below.</Text>
                                    <Text><b>3. Consultation:</b> After submitting your application, a registered doctor will review your case. This document requires a consultation to be valid.</Text>
                                </VStack>
                            </Box>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600" color="gray.700">Reason for Request</FormLabel>
                                <Textarea
                                    placeholder="e.g. For employment requirements, fit to work, school absence..."
                                    value={docReqReason}
                                    onChange={(e) => setDocReqReason(e.target.value)}
                                    focusBorderColor="teal.400"
                                    rows={2}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600" color="gray.700">Type of Sickness / Condition</FormLabel>
                                <Input
                                    placeholder="e.g. None (Healthy), Recovering from flu, etc."
                                    value={docReqSickness}
                                    onChange={(e) => setDocReqSickness(e.target.value)}
                                    focusBorderColor="teal.400"
                                />
                            </FormControl>

                            <Checkbox
                                colorScheme="teal"
                                mt={2}
                                isChecked={docReqConsult}
                                onChange={(e) => setDocReqConsult(e.target.checked)}
                            >
                                <Text fontSize="sm" fontWeight="600" color="gray.700">
                                    I acknowledge that I need to consult the doctor for this document to be valid.
                                </Text>
                            </Checkbox>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTopWidth="1px">
                        <Button variant="ghost" mr={3} onClick={onDocReqClose}>Cancel</Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleSubmitDocRequest}
                            isLoading={isDocReqSubmitting}
                            isDisabled={!docReqReason.trim() || !docReqSickness.trim() || !docReqConsult}
                            _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                        >
                            Submit Application
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpen} onClose={onClose} size={['record_detail'].includes(selectedCard as string) ? '2xl' : 'xl'} isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius={['record_detail'].includes(selectedCard as string) ? '2xl' : 'md'} overflow="hidden">
                    {selectedCard !== 'record_detail' && <ModalHeader>{selectedCard && selectedCard.replace('_', ' ').charAt(0).toUpperCase() + selectedCard.replace('_', ' ').slice(1)}</ModalHeader>}
                    <ModalCloseButton mt={['record_detail'].includes(selectedCard as string) ? 2 : 0} zIndex={10} />
                    {renderModalContent()}
                    {selectedCard !== 'record_detail' && (
                        <ModalFooter>
                            <Button colorScheme="teal" mr={3} onClick={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    )}
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
            <Modal isOpen={isDocReqModalOpen} onClose={onDocReqClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="xl">
                    <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" borderTopRadius="xl">
                        Request {docReqType}
                    </ModalHeader>
                    <ModalCloseButton mt={2} />
                    <ModalBody py={6}>
                        <VStack spacing={4} align="stretch">
                            <Text fontSize="sm" color="gray.600">
                                Please provide the necessary details for your {docReqType.toLowerCase()} request.
                            </Text>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Reason for Request</FormLabel>
                                <Textarea
                                    placeholder="e.g. For school requirement, pre-employment, fit to work, etc."
                                    value={docReqReason}
                                    onChange={(e) => setDocReqReason(e.target.value)}
                                    rows={3}
                                    focusBorderColor="teal.400"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Medical Condition / Sickness (if applicable)</FormLabel>
                                <Input
                                    placeholder="e.g. None (Healthy), Recovering from flu, etc."
                                    value={docReqSickness}
                                    onChange={(e) => setDocReqSickness(e.target.value)}
                                    focusBorderColor="teal.400"
                                />
                            </FormControl>

                            <Checkbox
                                colorScheme="teal"
                                mt={2}
                                isChecked={docReqConsult}
                                onChange={(e) => setDocReqConsult(e.target.checked)}
                            >
                                <Text fontSize="sm" fontWeight="600" color="gray.700">
                                    I acknowledge that I need to consult the doctor for this document to be valid.
                                </Text>
                            </Checkbox>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTopWidth="1px" borderBottomRadius="xl">
                        <Button variant="ghost" mr={3} onClick={onDocReqClose}>Cancel</Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleSubmitDocRequest}
                            isLoading={isDocReqSubmitting}
                            isDisabled={!docReqReason.trim() || !docReqConsult}
                            _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                        >
                            Submit Application
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Dashboard;
