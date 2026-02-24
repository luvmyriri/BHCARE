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
    Select,
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
        p={8}
        borderRadius="3xl"
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
        p={{ base: 8, md: 12 }}
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

    // Inventory Add Item State
    const { isOpen: isAddInventoryOpen, onOpen: onAddInventoryOpen, onClose: onAddInventoryClose } = useDisclosure();
    const [newInventoryItem, setNewInventoryItem] = useState({
        item_name: '',
        category: 'Medicine',
        stock_quantity: 0,
        unit: 'pcs'
    });

    const handleAddInventoryItem = async () => {
        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInventoryItem)
            });
            if (res.ok) {
                // Refresh Inventory
                const invRes = await fetch('/api/inventory');
                if (invRes.ok) {
                    const invData = await invRes.json();
                    setInventory(invData);
                }
                onAddInventoryClose();
                setNewInventoryItem({
                    item_name: '',
                    category: 'Medicine',
                    stock_quantity: 0,
                    unit: 'pcs'
                });
            } else {
                alert("Failed to add inventory item");
            }
        } catch (error) {
            console.error("Error adding item:", error);
        }
    };

    // Inventory Restock State
    const { isOpen: isRestockOpen, onOpen: onRestockOpen, onClose: onRestockClose } = useDisclosure();
    const [restockItemId, setRestockItemId] = useState<number | null>(null);
    const [restockQuantity, setRestockQuantity] = useState<number>(0);

    const handleRestockItem = async () => {
        if (!restockItemId || restockQuantity <= 0) return;

        try {
            const res = await fetch('/api/inventory/restock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: restockItemId, add_quantity: restockQuantity })
            });
            if (res.ok) {
                // Refresh Inventory
                const invRes = await fetch('/api/inventory');
                if (invRes.ok) {
                    const invData = await invRes.json();
                    setInventory(invData);
                }
                onRestockClose();
                setRestockItemId(null);
                setRestockQuantity(0);
            } else {
                alert("Failed to restock item");
            }
        } catch (error) {
            console.error("Error restocking item:", error);
        }
    };

    // Search & History State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('name-asc');
    const [historySearchQuery, setHistorySearchQuery] = useState('');
    const [historySortOrder, setHistorySortOrder] = useState('newest');
    const [selectedHistory, setSelectedHistory] = useState<any>(null);


    // Data State
    const [patientsQueue, setPatientsQueue] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]); // New state for registry
    const [labResults, setLabResults] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [medicalRecords, setMedicalRecords] = useState<any[]>([]); // New state for history tab

    const handleViewHistory = async (userId: number) => {
        try {
            // First get patient details from patients list or fetch if needed
            const patient = patients.find(p => p.id === userId);

            const res = await fetch(`/api/patients/${userId}/history`);
            if (res.ok) {
                const data = await res.json();
                setSelectedHistory({
                    patient: patient,
                    records: data
                });
                setSelectedCard('history-view'); // Use a specific card view for history
                onOpen();
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
                            doctorEmail={user?.email}
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
                        <ModalFooter><Button colorScheme="teal" onClick={onClose}>Close</Button></ModalFooter>
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
                                        {patientsQueue.filter(p => p.status === 'completed' || p.status === 'done').length > 0 ? (
                                            patientsQueue.filter(p => p.status === 'completed' || p.status === 'done').map(p => (
                                                <Tr key={p.id}>
                                                    <Td>{p.appointment_time}</Td>
                                                    <Td>{p.first_name} {p.last_name}</Td>
                                                    <Td>{p.diagnosis || 'N/A'}</Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={3} textAlign="center" color="gray.500">No completed consultations yet.</Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                        <ModalFooter><Button colorScheme="teal" onClick={onClose}>Close</Button></ModalFooter>
                    </>
                );
            case 'critical':
                return (
                    <>
                        <ModalHeader>Critical & High Priority Cases</ModalHeader>
                        <ModalBody>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Patient</Th><Th>Priority</Th><Th>Status</Th></Tr></Thead>
                                    <Tbody>
                                        {patientsQueue.filter(p => p.priority === 'critical' || p.priority === 'high').length > 0 ? (
                                            patientsQueue.filter(p => p.priority === 'critical' || p.priority === 'high').map(p => (
                                                <Tr key={p.id}>
                                                    <Td>{p.first_name} {p.last_name}</Td>
                                                    <Td><Badge colorScheme="red">{p.priority}</Badge></Td>
                                                    <Td>{p.status}</Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={3} textAlign="center" color="gray.500">No critical cases flagged for today.</Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                        <ModalFooter><Button colorScheme="teal" onClick={onClose}>Close</Button></ModalFooter>
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
                        <ModalFooter><Button colorScheme="teal" onClick={onClose}>Close</Button></ModalFooter>
                    </>
                );
            case 'history-view':
                return (
                    <>
                        <ModalHeader>Medical History: {selectedHistory?.patient?.first_name} {selectedHistory?.patient?.last_name}</ModalHeader>
                        <ModalBody>
                            <VStack align="stretch" spacing={4}>
                                <Box p={4} bg="gray.50" borderRadius="md">
                                    <Heading size="sm" mb={2}>Patient Profile</Heading>
                                    <Text fontSize="sm"><b>ID:</b> {selectedHistory?.patient?.p_id}</Text>
                                    <Text fontSize="sm"><b>Age/Gender:</b> {selectedHistory?.patient?.age} / {selectedHistory?.patient?.gender}</Text>
                                    <Text fontSize="sm"><b>Contact:</b> {selectedHistory?.patient?.contact_number}</Text>
                                </Box>

                                <Divider />
                                <Heading size="md" color="teal.800">Clinical Notes</Heading>

                                {selectedHistory?.records && selectedHistory.records.length > 0 ? (
                                    selectedHistory.records.map((record: any, index: number) => (
                                        <Box key={index} p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.200">
                                            <Flex justify="space-between" mb={2}>
                                                <Text fontWeight="bold" color="teal.600">{record.created_at}</Text>
                                                <Badge colorScheme="purple">{record.doctor_name || 'Medical Officer'}</Badge>
                                            </Flex>
                                            <VStack align="start" spacing={1} pl={2} borderLeft="2px solid" borderColor="teal.100">
                                                <Text fontSize="sm"><b>S:</b> {record.subjective}</Text>
                                                <Text fontSize="sm"><b>O:</b> {record.objective}</Text>
                                                <Text fontSize="sm"><b>A:</b> {record.assessment}</Text>
                                                <Text fontSize="sm"><b>P:</b> {record.plan}</Text>
                                            </VStack>
                                        </Box>
                                    ))
                                ) : (
                                    <Text color="gray.500" fontStyle="italic">No medical records found for this patient.</Text>
                                )}
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="teal" mr={3} onClick={onClose}>
                                Close
                            </Button>
                            <Button variant="ghost" onClick={() => {
                                onClose();
                                handleOpenSoap(selectedHistory?.patient?.user_id || selectedHistory?.patient?.id);
                            }}>
                                Add New SOAP Note
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
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="CLINIC ACTIVE"
                            title={`Dr. ${user?.last_name || 'Medical Officer'}'s Station 🩺`}
                            description={`You have ${patientsQueue.length} appointments scheduled for today. ${patientsQueue.filter(p => p.status === 'waiting' || p.status === 'pending').length} patients are currently in the waiting area.`}
                        />

                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={8}>
                            <DoctorStatCard label="Patients Today" value={patientsQueue.length || "0"} icon={FiUsers} color="teal" onClick={() => handleCardClick('patients')} />
                            <DoctorStatCard
                                label="Consultations Done"
                                value={patientsQueue.filter(p => p.status === 'completed' || p.status === 'done').length.toString()}
                                icon={FiClipboard}
                                color="orange"
                                onClick={() => handleCardClick('consultations')}
                            />
                            <DoctorStatCard
                                label="Critical Cases"
                                value={patientsQueue.filter(p => p.priority === 'critical' || p.priority === 'high').length.toString()}
                                icon={FiActivity}
                                color="red"
                                onClick={() => handleCardClick('critical')}
                            />
                            <DoctorStatCard label="Pending Lab Results" value={labResults.length || "0"} icon={FiBox} color="orange" onClick={() => handleCardClick('labs')} />
                        </SimpleGrid>

                        <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
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
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="PATIENT REGISTRY"
                            title="Patient Records Management"
                            description="Search, view, and update comprehensive medical histories for all registered community members."
                        />
                        <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" mb={6} align="center">
                                <Heading size="md" color="teal.800">All Registered Patients</Heading>
                                <HStack>
                                    <InputGroup w="300px">
                                        <InputLeftElement pointerEvents="none"><FiSearch color="gray.300" /></InputLeftElement>
                                        <Input
                                            placeholder="Search by name or ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </InputGroup>
                                    <Select w="150px" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                        <option value="name-asc">Name (A-Z)</option>
                                        <option value="name-desc">Name (Z-A)</option>
                                        <option value="recent">Recent Visit</option>
                                    </Select>
                                </HStack>
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
                                        ).sort((a, b) => {
                                            if (sortOrder === 'name-asc') {
                                                return a.first_name.localeCompare(b.first_name);
                                            } else if (sortOrder === 'name-desc') {
                                                return b.first_name.localeCompare(a.first_name);
                                            } else if (sortOrder === 'recent') {
                                                return new Date(b.last_visit || 0).getTime() - new Date(a.last_visit || 0).getTime();
                                            }
                                            return 0;
                                        }).length > 0 ? (
                                            patients.filter(p =>
                                                p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                p.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                (p.p_id && p.p_id.toLowerCase().includes(searchQuery.toLowerCase()))
                                            ).sort((a, b) => {
                                                if (sortOrder === 'name-asc') {
                                                    return a.first_name.localeCompare(b.first_name);
                                                } else if (sortOrder === 'name-desc') {
                                                    return b.first_name.localeCompare(a.first_name);
                                                } else if (sortOrder === 'recent') {
                                                    return new Date(b.last_visit || 0).getTime() - new Date(a.last_visit || 0).getTime();
                                                }
                                                return 0;
                                            }).map(p => (
                                                <Tr key={p.id}>
                                                    <Td fontWeight="bold" color="teal.600">{p.p_id}</Td>
                                                    <Td fontWeight="600">{p.first_name} {p.last_name}</Td>
                                                    <Td>{p.age} / {p.gender}</Td>
                                                    <Td>{p.contact_number}</Td>
                                                    <Td>{p.last_visit}</Td>
                                                    <Td>
                                                        <Button size="xs" colorScheme="teal" variant="ghost" onClick={() => handleViewHistory(p.id)}>View History</Button>
                                                        <Button size="xs" colorScheme="blue" ml={2} onClick={() => handleOpenSoap(p.id)}>SOAP</Button>
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
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="CLINIC SCHEDULE"
                            title="Duty and Consultation Hours"
                            description="Manage your clinic availability and view upcoming appointments in a detailed calendar view."
                        />
                        <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" mb={6}>
                                <Heading size="md" color="teal.800">My Schedule & Assignment</Heading>
                            </Flex>
                            <VStack align="start" spacing={4}>
                                <Box p={4} bg="teal.50" borderRadius="xl" w="full">
                                    <Heading size="sm" color="teal.700" mb={2}>Assigned Clinic Room</Heading>
                                    <Text fontSize="lg" fontWeight="bold">{user?.clinic_room || 'Not Assigned'}</Text>
                                </Box>
                                <Box p={4} bg="orange.50" borderRadius="xl" w="full">
                                    <Heading size="sm" color="orange.700" mb={2}>Weekly Schedule</Heading>
                                    <Text fontSize="lg" fontWeight="bold">{user?.schedule || 'No Schedule Available'}</Text>
                                    <Text fontSize="sm" color="gray.600" mt={1}>Please contact administration for schedule changes.</Text>
                                </Box>
                            </VStack>
                        </Box>
                    </VStack>
                );
            case 'history':
                return (
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="MEDICAL RECORDS"
                            title="Patient Medical History"
                            description="Access comprehensive medical records, past diagnoses, and treatment plans."
                        />
                        <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Heading size="md" color="teal.800" mb={4}>Recent Medical Records</Heading>
                            <Text color="gray.500" mb={4}>Select a patient from the Registry to view their full history.</Text>

                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Date</Th>
                                            <Th>Patient</Th>
                                            <Th>Diagnosis</Th>
                                            <Th>Attending Doctor</Th>
                                            <Th>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {/* Dynamic content could go here, for now guiding to patient list */}
                                        <Tr>
                                            <Td colSpan={5} textAlign="center" py={4} color="gray.500">
                                                Please go to <b>Patient Registry</b> and search for a patient to view their specific history.
                                            </Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );
            case 'records':
                // Logic to group medical records by patient (showing latest)
                const uniqueRecordsMap = new Map();
                medicalRecords.forEach(record => {
                    if (!uniqueRecordsMap.has(record.user_id)) {
                        uniqueRecordsMap.set(record.user_id, record);
                    }
                });

                const uniqueRecords = Array.from(uniqueRecordsMap.values());

                const filteredHistory = uniqueRecords.filter((r: any) =>
                    r.patient_name.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                    (r.diagnosis && r.diagnosis.toLowerCase().includes(historySearchQuery.toLowerCase()))
                ).sort((a, b) => {
                    if (historySortOrder === 'newest') {
                        return new Date(b.record_date || b.created_at || 0).getTime() - new Date(a.record_date || a.created_at || 0).getTime();
                    } else if (historySortOrder === 'oldest') {
                        return new Date(a.record_date || a.created_at || 0).getTime() - new Date(b.record_date || b.created_at || 0).getTime();
                    } else if (historySortOrder === 'name-asc') {
                        return (a.patient_name || '').localeCompare(b.patient_name || '');
                    } else if (historySortOrder === 'name-desc') {
                        return (b.patient_name || '').localeCompare(a.patient_name || '');
                    }
                    return 0;
                });

                return (
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="MEDICAL HISTORY"
                            title="Clinical Logs & Archives"
                            description="Review past consultations, prescriptions, and diagnostic results for patient longitudinal care."
                        />
                        <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" mb={6} align="center">
                                <Heading size="md" color="teal.800">Recent Patient Activity</Heading>
                                <HStack>
                                    <InputGroup w="300px">
                                        <InputLeftElement pointerEvents="none"><FiSearch color="gray.300" /></InputLeftElement>
                                        <Input
                                            placeholder="Search patient..."
                                            value={historySearchQuery}
                                            onChange={(e) => setHistorySearchQuery(e.target.value)}
                                        />
                                    </InputGroup>
                                    <Select w="150px" value={historySortOrder} onChange={(e) => setHistorySortOrder(e.target.value)}>
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="name-asc">Name (A-Z)</option>
                                        <option value="name-desc">Name (Z-A)</option>
                                    </Select>
                                </HStack>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Last Visit</Th>
                                            <Th>Patient</Th>
                                            <Th>Latest Diagnosis</Th>
                                            <Th>Attending Physician</Th>
                                            <Th>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredHistory.length > 0 ? (
                                            filteredHistory.map((r: any, i: number) => (
                                                <Tr key={i}>
                                                    <Td>{r.appointment_date}</Td>
                                                    <Td fontWeight="600">{r.patient_name}</Td>
                                                    <Td>{r.diagnosis || 'N/A'}</Td>
                                                    <Td>{r.doctor_name}</Td>
                                                    <Td>
                                                        <Button size="xs" colorScheme="teal" onClick={() => handleViewHistory(r.user_id)}>View Full History</Button>
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
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="PHARMACY INVENTORY"
                            title="Medicine & Equipment Stock"
                            description="Track available vaccinations, medicines, and first-aid supplies within the health center."
                        />
                        <Flex gap={4}>
                            <Box flex="1" bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <Heading size="sm" mb={4} color="teal.800">Low Stock Alerts</Heading>
                                <VStack align="stretch" spacing={3}>
                                    {inventory.filter(item => item.stock_quantity < 100).length > 0 ? (
                                        inventory.filter(item => item.stock_quantity < 100).map((item: any) => (
                                            <HStack key={item.id} justify="space-between" p={3} bg={item.stock_quantity < 50 ? 'red.50' : 'orange.50'} borderRadius="lg">
                                                <Text fontWeight="600" color={item.stock_quantity < 50 ? 'red.700' : 'orange.700'}>{item.item_name}</Text>
                                                <Badge colorScheme={item.stock_quantity < 50 ? 'red' : 'orange'}>{item.stock_quantity} {item.unit} left</Badge>
                                            </HStack>
                                        ))
                                    ) : (
                                        <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>No low stock items</Text>
                                    )}
                                </VStack>
                            </Box>
                            <Box flex="2" bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <Flex justify="space-between" mb={4}>
                                    <Heading size="sm" color="teal.800">Inventory List</Heading>
                                    <Button size="xs" colorScheme="teal" onClick={onAddInventoryOpen}>Add Item</Button>
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
                                                            <HStack justify="space-between" align="center">
                                                                <Badge colorScheme={item.stock_quantity < 50 ? 'red' : item.stock_quantity < 100 ? 'orange' : 'green'}>
                                                                    {item.status || (item.stock_quantity < 50 ? 'Low Stock' : 'Good')}
                                                                </Badge>
                                                                <Button
                                                                    size="xs"
                                                                    colorScheme="teal"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setRestockItemId(item.id);
                                                                        setRestockQuantity(0);
                                                                        onRestockOpen();
                                                                    }}
                                                                >
                                                                    Restock
                                                                </Button>
                                                            </HStack>
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
            <Box ml={{ base: 0, md: '280px' }} p={{ base: 6, md: 10 }} position="relative">
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
                    <ModalCloseButton />
                    {renderModalContent()}
                </ModalContent>
            </Modal>

            {/* Add Inventory Modal */}
            <Modal isOpen={isAddInventoryOpen} onClose={onAddInventoryClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Inventory Item</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Item Name</Text>
                                <Input
                                    value={newInventoryItem.item_name}
                                    onChange={(e) => setNewInventoryItem({ ...newInventoryItem, item_name: e.target.value })}
                                    placeholder="e.g. Paracetamol 500mg"
                                />
                            </Box>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Category</Text>
                                <select
                                    className="chakra-select css-1"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}
                                    value={newInventoryItem.category}
                                    onChange={(e) => setNewInventoryItem({ ...newInventoryItem, category: e.target.value })}
                                >
                                    <option value="Medicine">Medicine</option>
                                    <option value="Supplies">Supplies</option>
                                    <option value="Equipment">Equipment</option>
                                </select>
                            </Box>
                            <HStack w="full">
                                <Box w="full">
                                    <Text mb={1} fontSize="sm" fontWeight="bold">Initial Stock</Text>
                                    <Input
                                        type="number"
                                        value={newInventoryItem.stock_quantity}
                                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, stock_quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </Box>
                                <Box w="full">
                                    <Text mb={1} fontSize="sm" fontWeight="bold">Unit</Text>
                                    <Input
                                        value={newInventoryItem.unit}
                                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, unit: e.target.value })}
                                        placeholder="e.g. pcs, boxes"
                                    />
                                </Box>
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAddInventoryClose}>Cancel</Button>
                        <Button colorScheme="teal" onClick={handleAddInventoryItem}>Add Item</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Restock Inventory Modal */}
            <Modal isOpen={isRestockOpen} onClose={onRestockClose} size="sm">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Restock Item</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Quantity to Add</Text>
                                <Input
                                    type="number"
                                    value={restockQuantity === 0 ? '' : restockQuantity}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setRestockQuantity(val === '' ? 0 : parseInt(val));
                                    }}
                                    placeholder="Enter quantity"
                                />
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onRestockClose}>Cancel</Button>
                        <Button colorScheme="teal" onClick={handleRestockItem}>Confirm Restock</Button>
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


        </Box>
    );
};

export default DoctorDashboard;
