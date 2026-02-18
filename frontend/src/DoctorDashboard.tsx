import React, { useState } from 'react';
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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    IconButton,
    SimpleGrid,
    Spinner,
    Input,
    InputGroup,
    InputLeftElement,
} from '@chakra-ui/react';
import Profile from './Profile';
import {
    FiGrid,
    FiUsers,
    FiCalendar,
    FiLogOut,
    FiActivity,
    FiClipboard,
    FiBox,
    FiMenu,
    FiUser,
    FiSearch,
    FiClock,
    FiFileText,
} from 'react-icons/fi';

interface DoctorDashboardProps {
    user: any;
    onLogout: () => void;
    onUserUpdated?: (user: any) => void;
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

const DoctorStatCard = ({ label, value, icon, color, onClick }: any) => (
    <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
        flex="1"
        minW="200px"
        cursor={onClick ? "pointer" : "default"}
        onClick={onClick}
        transition="all 0.2s"
        _hover={onClick ? { transform: "translateY(-2px)", boxShadow: "md" } : {}}
    >
        <Flex align="center" justify="space-between">
            <VStack align="start" spacing={1}>
                <Text color="gray.500" fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="widest">
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
        mb={8}
    >
        <Box position="relative" zIndex={1}>
            <HStack spacing={4} mb={2}>
                <Badge colorScheme="orange" variant="solid" px={3} borderRadius="full">{badge}</Badge>
                <Text fontSize="xs" fontWeight="600" opacity={0.8}>Brgy. 174 Health Center</Text>
            </HStack>
            <Heading size={{ base: "lg", md: "xl" }} mb={4} lineHeight="1.2">
                {title}
            </Heading>
            <Text fontSize={{ base: "md", lg: "lg" }} opacity={0.9} maxW="lg">
                {description}
            </Text>
        </Box>
        <Icon
            as={FiActivity}
            position="absolute"
            right="-20px"
            bottom="-20px"
            boxSize={{ base: "150px", md: "200px" }}
            opacity={0.15}
            transform="rotate(-15deg)"
        />
    </Box>
);

import SoapNoteForm from './components/SoapNoteForm';

// ... existing imports

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onLogout, onUserUpdated }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
    const [selectedCard, setSelectedCard] = useState('');
    const [soapPatientId, setSoapPatientId] = useState<any>(null);

    // Search & History State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedHistory, setSelectedHistory] = useState<any>(null);
    const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure();

    // Data State
    const [patientsQueue, setPatientsQueue] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]); // New state for registry
    const [labResults, setLabResults] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [medicalRecords, setMedicalRecords] = useState<any[]>([]); // New state for history tab

    const handleViewHistory = async (userId: number) => {
        try {
            const res = await fetch(`/api/patients/${userId}/history`);
            if (res.ok) {
                const data = await res.json();
                setSelectedHistory(data);
                onHistoryOpen();
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Get today's date in YYYY-MM-DD
                const today = new Date().toISOString().split('T')[0];

                // Fetch Appointments (Queue)
                const queueRes = await fetch(`/api/appointments?date=${today}`);
                if (queueRes.ok) {
                    const queueData = await queueRes.json();
                    setPatientsQueue(queueData);
                }

                // Fetch Patient Registry
                const patRes = await fetch('/api/doctor/patients');
                if (patRes.ok) {
                    const patData = await patRes.json();
                    setPatients(patData);
                }

                // Fetch Medical Records (History Tab)
                const histRes = await fetch('/api/doctor/medical-records');
                if (histRes.ok) {
                    const histData = await histRes.json();
                    setMedicalRecords(histData);
                }

                // Fetch Lab Results
                const labsRes = await fetch('/api/lab-results?status=pending');
                if (labsRes.ok) {
                    const labsData = await labsRes.json();
                    setLabResults(labsData);
                }

                // Fetch Inventory
                const invRes = await fetch('/api/inventory');
                if (invRes.ok) {
                    const invData = await invRes.json();
                    setInventory(invData);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCardClick = (card: string) => {
        setSelectedCard(card);
        onOpen();
    };

    const handleOpenSoap = (patientId: any) => {
        setSoapPatientId(patientId);
        setSelectedCard('soap-form');
        onOpen();
    };

    const renderModalContent = () => {
        switch (selectedCard) {
            case 'soap-form':
                return (
                    <Box p={2}>
                        <SoapNoteForm
                            patientId={soapPatientId}
                            onSuccess={() => {
                                onClose();
                                // Optional: Refresh data or show success toast (handled in form)
                            }}
                            onCancel={onClose}
                        />
                    </Box>
                );
            case 'patients':
                return (
                    <>
                        <ModalHeader>Patients Today Queue</ModalHeader>
                        <ModalBody>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Time</Th><Th>Patient</Th><Th>Status</Th><Th>Action</Th></Tr></Thead>
                                    <Tbody>
                                        {patientsQueue.map((p) => (
                                            <Tr key={p.id}>
                                                <Td>{p.appointment_time}</Td>
                                                <Td>{p.first_name} {p.last_name}</Td>
                                                <Td><Badge colorScheme="orange">{p.status}</Badge></Td>
                                                <Td>
                                                    <Button size="xs" colorScheme="teal" onClick={() => handleOpenSoap(p.user_id)}>SOAP</Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                    </>
                );
            case 'consultations':
                return (
                    <>
                        <ModalHeader>Completed Consultations</ModalHeader>
                        <ModalBody>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Time</Th><Th>Patient</Th><Th>Diagnosis</Th></Tr></Thead>
                                    <Tbody>
                                        <Tr><Td>08:00 AM</Td><Td>Pedro Penduko</Td><Td>Common Cold</Td></Tr>
                                        <Tr><Td>08:30 AM</Td><Td>Clara Barton</Td><Td>Hypertension</Td></Tr>
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                    </>
                );
            case 'critical':
                return (
                    <>
                        <ModalHeader>Critical & High Priority Cases</ModalHeader>
                        <ModalBody>
                            <Text fontStyle="italic" color="gray.500">No critical cases flagged for today.</Text>
                        </ModalBody>
                    </>
                );
            case 'labs':
                return (
                    <>
                        <ModalHeader>Pending Laboratory Results</ModalHeader>
                        <ModalBody>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Patient</Th><Th>Test</Th><Th>Status</Th></Tr></Thead>
                                    <Tbody>
                                        {labResults.length > 0 ? (
                                            labResults.map((lab: any) => (
                                                <Tr key={lab.id}>
                                                    <Td>{lab.first_name} {lab.last_name}</Td>
                                                    <Td>{lab.test_type}</Td>
                                                    <Td>
                                                        <Badge colorScheme={lab.status === 'completed' ? 'green' : lab.status === 'processing' ? 'yellow' : 'gray'}>
                                                            {lab.status}
                                                        </Badge>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={3} textAlign="center" color="gray.500">No pending results</Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
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
        if (loading) {
            return (
                <Flex justify="center" align="center" h="50vh">
                    <Spinner size="xl" color="teal.500" />
                </Flex>
            );
        }
        switch (activeTab) {
            case 'overview':
                return (
                    <VStack align="stretch" spacing={8}>
                        <PageHero
                            badge="CLINIC ACTIVE"
                            title={`Dr. ${user?.last_name || 'Medical Officer'}'s Station 🩺`}
                            description="You have 8 consultations scheduled for today. 2 patients are currently in the waiting area."
                        />

                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
                            <DoctorStatCard label="Patients Today" value={patientsQueue.length || "0"} icon={FiUsers} color="teal" onClick={() => handleCardClick('patients')} />
                            <DoctorStatCard label="Consultations Done" value="2" icon={FiClipboard} color="orange" onClick={() => handleCardClick('consultations')} />
                            <DoctorStatCard label="Critical Cases" value="0" icon={FiActivity} color="red" onClick={() => handleCardClick('critical')} />
                            <DoctorStatCard label="Pending Lab Results" value={labResults.length || "0"} icon={FiBox} color="orange" onClick={() => handleCardClick('labs')} />
                        </SimpleGrid>

                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md" color="teal.800">Current Patient Queue</Heading>
                                <Button size="sm" colorScheme="orange" variant="outline" leftIcon={<FiCalendar />} onClick={() => setActiveTab('schedule')}>View Schedule</Button>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Patient Name</Th>
                                            <Th>Appt. Time</Th>
                                            <Th>Reason</Th>
                                            <Th>Status</Th>
                                            <Th>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {patientsQueue.length > 0 ? (
                                            patientsQueue.map(p => (
                                                <Tr key={p.id}>
                                                    <Td fontWeight="600">{p.first_name} {p.last_name}</Td>
                                                    <Td>{p.appointment_time}</Td>
                                                    <Td>{p.reason || 'N/A'}</Td>
                                                    <Td>
                                                        <Badge
                                                            colorScheme={p.status === 'consulting' ? 'green' : p.status === 'waiting' ? 'orange' : 'gray'}
                                                            borderRadius="full"
                                                            px={3}
                                                        >
                                                            {p.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Button size="xs" colorScheme="teal" variant="ghost">View Details</Button>
                                                        <Button size="xs" colorScheme="blue" ml={2} onClick={() => handleOpenSoap(p.user_id)}>SOAP</Button>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={5} textAlign="center" py={4} color="gray.500">
                                                    No patients in queue
                                                </Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );
            case 'patients':
                return (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge="PATIENT REGISTRY"
                            title="Patient Records Management"
                            description="Search, view, and update comprehensive medical histories for all registered community members."
                        />
                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" mb={6} align="center">
                                <Heading size="md" color="teal.800">All Registered Patients</Heading>
                                <InputGroup w="300px">
                                    <InputLeftElement pointerEvents="none"><FiSearch color="gray.300" /></InputLeftElement>
                                    <Input
                                        placeholder="Search by name or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </InputGroup>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Patient ID</Th>
                                            <Th>Name</Th>
                                            <Th>Age/Gender</Th>
                                            <Th>Contact</Th>
                                            <Th>Last Visit</Th>
                                            <Th>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {patients.filter(p =>
                                            p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            p.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (p.p_id && p.p_id.toLowerCase().includes(searchQuery.toLowerCase()))
                                        ).length > 0 ? (
                                            patients.filter(p =>
                                                p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                p.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                (p.p_id && p.p_id.toLowerCase().includes(searchQuery.toLowerCase()))
                                            ).map(p => (
                                                <Tr key={p.id}>
                                                    <Td fontWeight="bold" color="teal.600">{p.p_id}</Td>
                                                    <Td fontWeight="600">{p.first_name} {p.last_name}</Td>
                                                    <Td>{p.age} / {p.gender}</Td>
                                                    <Td>{p.contact_number}</Td>
                                                    <Td>{p.last_visit}</Td>
                                                    <Td>
                                                        <Button size="xs" colorScheme="blue" variant="outline" onClick={() => handleViewHistory(p.id)}>View Profile</Button>
                                                        <Button size="xs" colorScheme="teal" ml={2} onClick={() => handleOpenSoap(p.id)}>SOAP</Button>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={6} textAlign="center">No patients found.</Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );

            case 'schedule':
                return (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge="CLINIC SCHEDULE"
                            title="Duty and Consultation Hours"
                            description="Manage your clinic availability and view upcoming appointments in a detailed calendar view."
                        />
                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" mb={6}>
                                <Heading size="md" color="teal.800">Weekly Schedule</Heading>
                                <Button size="sm" colorScheme="orange" variant="outline">Print Schedule</Button>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Day</Th>
                                            <Th>Time Slot</Th>
                                            <Th>Type</Th>
                                            <Th>Assigned Room</Th>
                                            <Th>Status</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        <Tr>
                                            <Td fontWeight="bold">Monday</Td>
                                            <Td>8:00 AM - 12:00 PM</Td>
                                            <Td>General Consultation</Td>
                                            <Td>Room 101</Td>
                                            <Td><Badge colorScheme="green">On Duty</Badge></Td>
                                        </Tr>
                                        <Tr>
                                            <Td fontWeight="bold">Tuesday</Td>
                                            <Td>1:00 PM - 5:00 PM</Td>
                                            <Td>Vaccination Drive</Td>
                                            <Td>Community Hall</Td>
                                            <Td><Badge colorScheme="blue">Scheduled</Badge></Td>
                                        </Tr>
                                        <Tr>
                                            <Td fontWeight="bold">Wednesday</Td>
                                            <Td>8:00 AM - 12:00 PM</Td>
                                            <Td>Prenatal Checkup</Td>
                                            <Td>Room 102</Td>
                                            <Td><Badge colorScheme="blue">Scheduled</Badge></Td>
                                        </Tr>
                                        <Tr>
                                            <Td fontWeight="bold">Thursday</Td>
                                            <Td>8:00 AM - 5:00 PM</Td>
                                            <Td>Administrative / Training</Td>
                                            <Td>Office</Td>
                                            <Td><Badge colorScheme="purple">Training</Badge></Td>
                                        </Tr>
                                        <Tr>
                                            <Td fontWeight="bold">Friday</Td>
                                            <Td>1:00 PM - 5:00 PM</Td>
                                            <Td>Follow-up Visits</Td>
                                            <Td>Room 101</Td>
                                            <Td><Badge colorScheme="blue">Scheduled</Badge></Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );
            case 'records':
                return (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge="MEDICAL HISTORY"
                            title="Clinical Logs & Archives"
                            description="Review past consultations, prescriptions, and diagnostic results for patient longitudinal care."
                        />
                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" mb={6}>
                                <Heading size="md" color="teal.800">Recent Medical Records</Heading>
                                <HStack>
                                    <Button size="sm" variant="outline">Filter by Date</Button>
                                    <Button size="sm" variant="outline">Filter by Diagnosis</Button>
                                </HStack>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Date</Th>
                                            <Th>Patient</Th>
                                            <Th>Diagnosis</Th>
                                            <Th>Attending Physician</Th>
                                            <Th>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {medicalRecords.length > 0 ? (
                                            medicalRecords.map((r, i) => (
                                                <Tr key={i}>
                                                    <Td>{r.appointment_date}</Td>
                                                    <Td fontWeight="600">{r.patient_name}</Td>
                                                    <Td>{r.diagnosis || 'N/A'}</Td>
                                                    <Td>{r.doctor_name}</Td>
                                                    <Td>
                                                        <Button size="xs" colorScheme="teal" onClick={() => handleViewHistory(r.user_id)}>View Details</Button>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={5} textAlign="center">No medical records found.</Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );
            case 'inventory':
                return (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge="PHARMACY INVENTORY"
                            title="Medicine & Equipment Stock"
                            description="Track available vaccinations, medicines, and first-aid supplies within the health center."
                        />
                        <Flex gap={4}>
                            <Box flex="1" bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <Heading size="sm" mb={4} color="teal.800">Low Stock Alerts</Heading>
                                <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between" p={3} bg="red.50" borderRadius="lg">
                                        <Text fontWeight="600" color="red.700">Paracetamol 500mg</Text>
                                        <Badge colorScheme="red">50 pcs left</Badge>
                                    </HStack>
                                    <HStack justify="space-between" p={3} bg="orange.50" borderRadius="lg">
                                        <Text fontWeight="600" color="orange.700">Amoxicillin 500mg</Text>
                                        <Badge colorScheme="orange">100 pcs left</Badge>
                                    </HStack>
                                </VStack>
                            </Box>
                            <Box flex="2" bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <Flex justify="space-between" mb={4}>
                                    <Heading size="sm" color="teal.800">Inventory List</Heading>
                                    <Button size="xs" colorScheme="teal">Add Item</Button>
                                </Flex>
                                <Box overflowX="auto">
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Item Name</Th>
                                                <Th>Category</Th>
                                                <Th>Stock</Th>
                                                <Th>Status</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {inventory.length > 0 ? (
                                                inventory.map((item: any) => (
                                                    <Tr key={item.id}>
                                                        <Td fontWeight="600">{item.item_name}</Td>
                                                        <Td>{item.category}</Td>
                                                        <Td>{item.stock_quantity} {item.unit}</Td>
                                                        <Td>
                                                            <Badge colorScheme={item.stock_quantity < 50 ? 'red' : item.stock_quantity < 100 ? 'orange' : 'green'}>
                                                                {item.status || (item.stock_quantity < 50 ? 'Low Stock' : 'Good')}
                                                            </Badge>
                                                        </Td>
                                                    </Tr>
                                                ))
                                            ) : (
                                                <Tr>
                                                    <Td colSpan={4} textAlign="center" py={4} color="gray.500">
                                                        Inventory is empty
                                                    </Td>
                                                </Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>
                        </Flex>
                    </VStack >
                );
            case 'profile':
                return (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge="PROFILE SETTINGS"
                            title="My Professional Profile"
                            description="Manage your account details, security settings, and personal information."
                        />
                        <Profile
                            user={user}
                            onClose={() => setActiveTab('overview')}
                            onUpdated={(u) => {
                                if (onUserUpdated) onUserUpdated(u);
                            }}
                        />
                    </VStack>
                );
            default:
                return null;
        }
    };

    return (
        <Box minH="100vh" bg="#f8f9fc">
            {/* Doctor Sidebar */}
            <Box
                w={{ base: 'full', md: '280px' }}
                pos="fixed"
                h="full"
                bg="white"
                borderRight="1px"
                borderRightColor="gray.200"
                display={{ base: 'none', md: 'block' }}
                boxShadow="md"
            >
                <Flex h="20" align="center" mx="8" mb={8}>
                    <HStack spacing={3}>
                        <img src="/images/Logo.png" alt="Logo" style={{ height: '32px' }} />
                        <Text fontSize="xl" fontWeight="800" color="teal.800" letterSpacing="tight">
                            BHCare <Text as="span" color="orange.500" fontSize="xs">PRO</Text>
                        </Text>
                    </HStack>
                </Flex>

                <VStack spacing={2} align="stretch" px={4}>
                    <NavItem icon={FiGrid} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                        Medical Overview
                    </NavItem>
                    <NavItem icon={FiUsers} active={activeTab === 'patients'} onClick={() => setActiveTab('patients')}>
                        Patient Registry
                    </NavItem>
                    <NavItem icon={FiCalendar} active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
                        Clinic Schedule
                    </NavItem>
                    <NavItem icon={FiClipboard} active={activeTab === 'records'} onClick={() => setActiveTab('records')}>
                        Medical History
                    </NavItem>
                    <NavItem icon={FiBox} active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
                        Pharmacy Inventory
                    </NavItem>
                    <NavItem icon={FiUser} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                        Profile Setting
                    </NavItem>
                </VStack>

                <Box pos="absolute" bottom="8" w="full" px={4}>
                    <Divider mb={4} />
                    <NavItem icon={FiLogOut} onClick={onLogout}>
                        Exit Station
                    </NavItem>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box ml={{ base: 0, md: '280px' }} p="8" position="relative">
                <Flex justify="space-between" align="center" mb={10}>
                    <HStack spacing={4}>
                        <IconButton
                            display={{ base: 'flex', md: 'none' }}
                            onClick={onSidebarOpen}
                            variant="outline"
                            aria-label="open menu"
                            icon={<FiMenu />}
                        />
                        <VStack align="start" spacing={0}>
                            <Heading size="md" color="teal.800" textTransform="capitalize">
                                {activeTab.replace('-', ' ')}
                            </Heading>
                            <Text color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                                Medical Control Center
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack spacing={4}>
                        <VStack align="end" spacing={0} mr={2}>
                            <Text fontWeight="800" color="teal.800" fontSize="sm">
                                Dr. {user?.first_name} {user?.last_name}
                            </Text>
                            <Text color="teal.500" fontSize="xs" fontWeight="700">
                                Medical Officer III
                            </Text>
                        </VStack>
                        <Avatar size="md" name={`Dr. ${user?.first_name} ${user?.last_name}`} bg="teal.500" color="white" border="2px solid white" boxShadow="lg" />
                    </HStack>
                </Flex>

                <Box>
                    {renderContent()}
                </Box>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedCard && selectedCard.charAt(0).toUpperCase() + selectedCard.slice(1)} Details</ModalHeader>
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
                                        BHCare <Text as="span" color="orange.500" fontSize="xs">PRO</Text>
                                    </Text>
                                </HStack>
                            </Flex>
                            <VStack spacing={2} align="stretch" px={4}>
                                <NavItem icon={FiGrid} active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); onSidebarClose(); }}>
                                    Medical Overview
                                </NavItem>
                                <NavItem icon={FiUsers} active={activeTab === 'patients'} onClick={() => { setActiveTab('patients'); onSidebarClose(); }}>
                                    Patient Registry
                                </NavItem>
                                <NavItem icon={FiCalendar} active={activeTab === 'schedule'} onClick={() => { setActiveTab('schedule'); onSidebarClose(); }}>
                                    Clinic Schedule
                                </NavItem>
                                <NavItem icon={FiClipboard} active={activeTab === 'records'} onClick={() => { setActiveTab('records'); onSidebarClose(); }}>
                                    Medical History
                                </NavItem>
                                <NavItem icon={FiBox} active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); onSidebarClose(); }}>
                                    Pharmacy Inventory
                                </NavItem>
                                <NavItem icon={FiUser} active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); onSidebarClose(); }}>
                                    Profile Setting
                                </NavItem>
                            </VStack>
                            <Box pos="absolute" bottom="8" w="full" px={4}>
                                <Divider mb={4} />
                                <NavItem icon={FiLogOut} onClick={onLogout}>
                                    Exit Station
                                </NavItem>
                            </Box>
                        </Box>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* Medical History Modal */}
            <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="3xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Patient Medical History</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedHistory ? (
                            <VStack align="stretch" spacing={6}>
                                <Box bg="blue.50" p={4} borderRadius="xl">
                                    <HStack spacing={4}>
                                        <Avatar size="lg" name={`${selectedHistory.patient.first_name} ${selectedHistory.patient.last_name}`} />
                                        <VStack align="start" spacing={1}>
                                            <Heading size="md">{selectedHistory.patient.first_name} {selectedHistory.patient.last_name}</Heading>
                                            <Text fontSize="sm" color="gray.600">ID: P-{String(selectedHistory.patient.id).padStart(4, '0')} | {selectedHistory.patient.age} yrs | {selectedHistory.patient.gender}</Text>
                                            <HStack>
                                                <Badge colorScheme="blue">{selectedHistory.patient.blood_type || 'Blood Type N/A'}</Badge>
                                                <Badge colorScheme="green">{selectedHistory.patient.height || '-'} cm</Badge>
                                                <Badge colorScheme="orange">{selectedHistory.patient.weight || '-'} kg</Badge>
                                            </HStack>
                                        </VStack>
                                    </HStack>
                                </Box>

                                <Box>
                                    <Heading size="sm" mb={4} color="gray.700">Past Consultations</Heading>
                                    {selectedHistory.history.length > 0 ? (
                                        <VStack align="stretch" spacing={3}>
                                            {selectedHistory.history.map((h: any, i: number) => (
                                                <Box key={i} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg">
                                                    <Flex justify="space-between" mb={2}>
                                                        <HStack>
                                                            <Icon as={FiCalendar} color="gray.500" />
                                                            <Text fontWeight="bold">{h.appointment_date}</Text>
                                                            <Text color="gray.500" fontSize="sm">({h.appointment_time})</Text>
                                                        </HStack>
                                                        <Badge colorScheme="green">{h.service_type}</Badge>
                                                    </Flex>
                                                    <Text fontWeight="600" color="teal.700">Diagnosis: {h.diagnosis || 'N/A'}</Text>
                                                    <Text fontSize="sm" mt={1} color="gray.600">{h.notes || 'No notes recorded.'}</Text>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Text fontStyle="italic" color="gray.500">No past medical records found.</Text>
                                    )}
                                </Box>
                            </VStack>
                        ) : (
                            <Flex justify="center" p={8}><Spinner /></Flex>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onHistoryClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default DoctorDashboard;
