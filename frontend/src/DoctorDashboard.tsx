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
    useToast,
} from '@chakra-ui/react';
import Profile from './Profile';

import PDFPreviewPage from './components/PDFPreviewPage';
import { formatSystemDate, formatSystemTime } from './utils/dateFormatter';
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
    FiFileText,
    FiDownload,
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
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();

    const [pdfPreviewPageData, setPdfPreviewPageData] = useState<{ patient: any; records: any[] } | null>(null);
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

    const MAX_STOCK = 100;

    const handleAddInventoryItem = async () => {
        if (newInventoryItem.stock_quantity > MAX_STOCK) {
            toast({
                title: "Stock Limit Exceeded",
                description: `Initial stock cannot exceed ${MAX_STOCK} units.`,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
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
                toast({
                    title: "Item Added",
                    status: "success",
                    duration: 2500,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add inventory item",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error adding item:", error);
        }
    };

    // Inventory Restock State
    const { isOpen: isRestockOpen, onOpen: onRestockOpen, onClose: onRestockClose } = useDisclosure();
    const [restockItemId, setRestockItemId] = useState<number | null>(null);
    const [restockQuantity, setRestockQuantity] = useState<number>(0);

    // Inventory Edit State
    const { isOpen: isEditInventoryOpen, onOpen: onEditInventoryOpen, onClose: onEditInventoryClose } = useDisclosure();
    const [editInventoryItem, setEditInventoryItem] = useState<any>(null);

    const handleRestockItem = async () => {
        if (!restockItemId || restockQuantity <= 0) return;

        // Find current stock for this item
        const currentItem = inventory.find((item: any) => item.id === restockItemId);
        const currentStock = currentItem ? currentItem.stock_quantity : 0;
        if (currentStock + restockQuantity > MAX_STOCK) {
            toast({
                title: "Stock Limit Exceeded",
                description: `Cannot restock: total would be ${currentStock + restockQuantity}. Maximum allowed is ${MAX_STOCK}.`,
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            return;
        }

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
                toast({
                    title: "Error",
                    description: "Failed to restock item",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error restocking item:", error);
        }
    };

    const confirmRestockItem = () => {
        if (!restockItemId || restockQuantity <= 0) return;
        const toastId = `confirm-restock-${restockItemId}`;
        if (toast.isActive(toastId)) return;
        toast({
            id: toastId,
            position: 'top',
            duration: 8000,
            isClosable: true,
            status: 'warning',
            render: ({ onClose }) => (
                <Box bg="white" border="1px solid" borderColor="orange.200" boxShadow="lg" borderRadius="xl" p={4} maxW="420px">
                    <Text fontWeight="800" color="orange.700" mb={1}>Confirm restock</Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                        Add <strong>{restockQuantity}</strong> to this item’s stock?
                    </Text>
                    <HStack justify="flex-end">
                        <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button size="sm" colorScheme="teal" onClick={async () => { onClose(); await handleRestockItem(); }}>
                            Yes, restock
                        </Button>
                    </HStack>
                </Box>
            ),
        });
    };

    const handleUpdateInventoryItem = async () => {
        if (!editInventoryItem?.id) return;
        const decreaseAmt = editInventoryItem.decrease_stock || 0;
        if (decreaseAmt > 0 && decreaseAmt > editInventoryItem.stock_quantity) {
            toast({ title: "Invalid Amount", description: `Cannot decrease by ${decreaseAmt}. Current stock is only ${editInventoryItem.stock_quantity}.`, status: "error", duration: 3000, isClosable: true });
            return;
        }
        try {
            const res = await fetch(`/api/inventory/${editInventoryItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_name: editInventoryItem.item_name,
                    category: editInventoryItem.category,
                    unit: editInventoryItem.unit,
                    decrease_stock: decreaseAmt,
                })
            });
            if (res.ok) {
                toast({ title: "Item Updated", status: "success", duration: 2500, isClosable: true });
                const invRes = await fetch('/api/inventory');
                if (invRes.ok) {
                    const invData = await invRes.json();
                    setInventory(invData);
                }
                onEditInventoryClose();
                setEditInventoryItem(null);
            } else {
                const data = await res.json().catch(() => ({} as any));
                toast({ title: "Error", description: data.error || "Failed to update item", status: "error", duration: 3000, isClosable: true });
            }
        } catch (error) {
            console.error("Error updating item:", error);
            toast({ title: "Error", description: "Failed to update item", status: "error", duration: 3000, isClosable: true });
        }
    };

    const confirmUpdateInventoryItem = () => {
        if (!editInventoryItem?.id) return;
        const toastId = `confirm-edit-${editInventoryItem.id}`;
        if (toast.isActive(toastId)) return;
        toast({
            id: toastId,
            position: 'top',
            duration: 8000,
            isClosable: true,
            status: 'warning',
            render: ({ onClose }) => (
                <Box bg="white" border="1px solid" borderColor="orange.200" boxShadow="lg" borderRadius="xl" p={4} maxW="460px">
                    <Text fontWeight="800" color="orange.700" mb={1}>Confirm changes</Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                        Save updates to <strong>{editInventoryItem.item_name}</strong>?
                    </Text>
                    <HStack justify="flex-end">
                        <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button size="sm" colorScheme="teal" onClick={async () => { onClose(); await handleUpdateInventoryItem(); }}>
                            Yes, save
                        </Button>
                    </HStack>
                </Box>
            ),
        });
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
    const [documentRequests, setDocumentRequests] = useState<any[]>([]);
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

                // Fetch Document Requests
                const docsRes = await fetch('/api/documents/pending');
                if (docsRes.ok) {
                    const docsData = await docsRes.json();
                    setDocumentRequests(docsData);
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

    // Helper to format User IDs consistently
    const formatUserId = (id: number | string, role: string, createdAt?: string) => {
        if (!id) return '—';
        let prefix = 'PT'; // Default Patient
        const roleLower = (role || '').toLowerCase();
        if (roleLower.includes('doctor')) prefix = 'DR';
        else if (roleLower.includes('super admin') || roleLower.includes('superadmin')) prefix = 'SA';
        else if (roleLower.includes('medic') || roleLower.includes('staff')) prefix = 'MS';
        else if (roleLower.includes('admin')) prefix = 'AD';

        const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
        const paddedId = String(id).padStart(3, '0');
        return `${prefix}${year}${paddedId}`;
    };

    // Open the full-page PDF preview/editor
    const openPdfPreviewPage = () => {
        if (!selectedHistory) return;
        setPdfPreviewPageData({
            patient: selectedHistory.patient,
            records: selectedHistory.records || [],
        });
        onClose(); // close the modal
    };



    const renderModalContent = () => {
        switch (selectedCard) {
            case 'soap-form':
                return (
                    <ModalBody p={0}>
                        <SoapNoteForm
                            patientId={soapPatientId}
                            doctorEmail={user?.email}
                            onSuccess={() => {
                                onClose();
                                setActiveTab('records'); // Redirect to Medical History records
                            }}
                            onCancel={onClose}
                        />
                    </ModalBody>
                );
            case 'patients':
                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <HStack align="center" spacing={3}>
                                <Icon as={FiUsers} boxSize={6} />
                                <Text>Patients Today Queue</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                <Table variant="simple" size="sm">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th py={4} color="gray.600">Time</Th>
                                            <Th py={4} color="gray.600">Patient</Th>
                                            <Th py={4} color="gray.600">Status</Th>
                                            <Th py={4} color="gray.600">Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {patientsQueue.length > 0 ? (
                                            patientsQueue.map((p) => (
                                                <Tr key={p.id} _hover={{ bg: "gray.50", transition: "0.2s" }}>
                                                    <Td>{formatSystemTime(p.appointment_time)}</Td>
                                                    <Td fontWeight="700" color="teal.700">{p.first_name} {p.last_name}</Td>
                                                    <Td>
                                                        <Badge colorScheme={p.status === 'consulting' ? 'green' : p.status === 'waiting' ? 'orange' : 'gray'} px={3} py={1} borderRadius="full">
                                                            {p.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Button size="sm" colorScheme="teal" onClick={() => handleOpenSoap(p.user_id)} _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}>
                                                            SOAP
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={4} py={10}>
                                                    <VStack color="gray.400" spacing={3}>
                                                        <Icon as={FiUsers} boxSize={12} color="gray.300" />
                                                        <Text fontSize="md" fontWeight="500">No patients in the queue for today.</Text>
                                                    </VStack>
                                                </Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                        <ModalFooter bg="gray.50" borderTopWidth="1px">
                            <Button colorScheme="teal" variant="ghost" onClick={onClose}>Close</Button>
                        </ModalFooter>
                    </>
                );
            case 'consultations':
                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <HStack align="center" spacing={3}>
                                <Icon as={FiClipboard} boxSize={6} />
                                <Text>Completed Consultations</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                <Table variant="simple" size="sm">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th py={4} color="gray.600">Time</Th>
                                            <Th py={4} color="gray.600">Patient</Th>
                                            <Th py={4} color="gray.600">Diagnosis</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {patientsQueue.filter(p => p.status === 'completed' || p.status === 'done').length > 0 ? (
                                            patientsQueue.filter(p => p.status === 'completed' || p.status === 'done').map(p => (
                                                <Tr key={p.id} _hover={{ bg: "gray.50", transition: "0.2s" }}>
                                                    <Td>{formatSystemTime(p.appointment_time)}</Td>
                                                    <Td fontWeight="700" color="teal.700">{p.first_name} {p.last_name}</Td>
                                                    <Td>
                                                        <Text fontSize="sm" color="gray.700">{p.diagnosis || 'N/A'}</Text>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={3} py={10}>
                                                    <VStack color="gray.400" spacing={3}>
                                                        <Icon as={FiClipboard} boxSize={12} color="gray.300" />
                                                        <Text fontSize="md" fontWeight="500">No completed consultations yet.</Text>
                                                    </VStack>
                                                </Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                        <ModalFooter bg="gray.50" borderTopWidth="1px">
                            <Button colorScheme="teal" variant="ghost" onClick={onClose}>Close</Button>
                        </ModalFooter>
                    </>
                );

            case 'docs':
                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <HStack align="center" spacing={3}>
                                <Icon as={FiFileText} boxSize={6} />
                                <Text>Pending Document Requests</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                <Table variant="simple" size="sm">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th py={4} color="gray.600">Date Req</Th>
                                            <Th py={4} color="gray.600">Patient Info</Th>
                                            <Th py={4} color="gray.600">Document Type</Th>
                                            <Th py={4} color="gray.600">Evaluation Details</Th>
                                            <Th py={4} color="gray.600">Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {documentRequests.length > 0 ? (
                                            documentRequests.map((doc: any) => (
                                                <Tr key={doc.id} _hover={{ bg: "gray.50", transition: "0.2s" }}>
                                                    <Td>{formatSystemDate(doc.created_at)}</Td>
                                                    <Td fontWeight="700" color="teal.700">{doc.first_name} {doc.last_name}</Td>
                                                    <Td>
                                                        <Badge colorScheme={doc.document_type.includes('Clearance') ? 'orange' : 'purple'} px={3} py={1} borderRadius="full">
                                                            {doc.document_type}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={1} maxW="250px">
                                                            <Text fontSize="xs" fontWeight="bold" color="gray.600">Reason: <Text as="span" fontWeight="normal" color="gray.900">{doc.reason || 'N/A'}</Text></Text>
                                                            <Text fontSize="xs" fontWeight="bold" color="gray.600">Condition: <Text as="span" fontWeight="normal" color="gray.900">{doc.sickness || 'N/A'}</Text></Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <Button size="sm" colorScheme="blue" leftIcon={<Icon as={FiClipboard} />} onClick={async () => {
                                                            try {
                                                                await fetch(`/api/documents/${doc.id}/complete`, { method: 'PUT' });
                                                                setDocumentRequests(prev => prev.filter(d => d.id !== doc.id));
                                                            } catch (err) {
                                                                console.error("Failed to complete document request", err);
                                                            }
                                                        }}
                                                            _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                                                        >
                                                            Mark as Done
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={5} py={10}>
                                                    <VStack color="gray.400" spacing={3}>
                                                        <Icon as={FiFileText} boxSize={12} color="gray.300" />
                                                        <Text fontSize="md" fontWeight="500">No pending document requests at the moment.</Text>
                                                    </VStack>
                                                </Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                        <ModalFooter bg="gray.50" borderTopWidth="1px">
                            <Button colorScheme="teal" variant="ghost" onClick={onClose} mr={3}>Close</Button>
                        </ModalFooter>
                    </>
                );
            case 'history-view':
                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <HStack align="center" spacing={3}>
                                <Icon as={FiClipboard} boxSize={6} />
                                <Text>Medical History: {selectedHistory?.patient?.first_name} {selectedHistory?.patient?.last_name}</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            <VStack align="stretch" spacing={6}>
                                <Box p={5} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
                                    <Heading size="sm" mb={3} color="blue.800">Patient Profile</Heading>
                                    <SimpleGrid columns={2} spacing={2}>
                                        <Text fontSize="sm"><Text as="span" fontWeight="800">ID:</Text> {selectedHistory?.patient?.p_id}</Text>
                                        <Text fontSize="sm"><Text as="span" fontWeight="800">Age/Gender:</Text> {selectedHistory?.patient?.age} / {selectedHistory?.patient?.gender}</Text>
                                        <Text fontSize="sm"><Text as="span" fontWeight="800">Contact:</Text> {selectedHistory?.patient?.contact_number}</Text>
                                    </SimpleGrid>
                                </Box>

                                <Heading size="md" color="teal.800" mt={2}>Clinical Notes</Heading>

                                {selectedHistory?.records && selectedHistory.records.length > 0 ? (
                                    <VStack spacing={4} align="stretch">
                                        {selectedHistory.records.map((record: any, index: number) => (
                                            <Box key={index} p={5} bg="white" borderWidth="1px" borderRadius="xl" borderColor="gray.200" boxShadow="sm" _hover={{ boxShadow: 'md', borderColor: 'teal.200', transition: '0.2s' }}>
                                                <Flex justify="space-between" align="center" mb={4}>
                                                    <Text fontWeight="bold" fontSize="sm" color="teal.600">{formatSystemDate(record.created_at)}</Text>
                                                    <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>{record.doctor_name || 'Medical Officer'}</Badge>
                                                </Flex>
                                                <VStack align="start" spacing={2} pl={4} borderLeft="3px solid" borderColor="teal.200">
                                                    <Text fontSize="sm"><Text as="span" fontWeight="800" color="gray.700">S:</Text> {record.subjective}</Text>
                                                    <Text fontSize="sm"><Text as="span" fontWeight="800" color="gray.700">O:</Text> {record.objective}</Text>
                                                    <Text fontSize="sm"><Text as="span" fontWeight="800" color="gray.700">A:</Text> {record.assessment}</Text>
                                                    <Text fontSize="sm"><Text as="span" fontWeight="800" color="gray.700">P:</Text> {record.plan}</Text>
                                                    {(() => {
                                                        let meds = [];
                                                        try {
                                                            meds = typeof record.prescription === 'string' ? JSON.parse(record.prescription) : record.prescription;
                                                        } catch (e) { }

                                                        if (meds && Array.isArray(meds) && meds.length > 0) {
                                                            return (
                                                                <Box mt={2} p={3} bg="teal.50" borderRadius="md" w="full" borderLeft="2px solid" borderColor="teal.400">
                                                                    <Text fontSize="xs" fontWeight="bold" color="teal.800" mb={2}>Dispensed Medicine(s):</Text>
                                                                    <VStack align="start" spacing={1}>
                                                                        {meds.map((med: any, i: number) => (
                                                                            <HStack key={i} fontSize="sm">
                                                                                <Icon as={FiBox} color="teal.500" />
                                                                                <Text fontWeight="700" color="teal.700">{med.item_name}</Text>
                                                                                <Text color="gray.500">x{med.quantity}</Text>
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
                                        ))}
                                    </VStack>
                                ) : (
                                    <Box py={8} textAlign="center">
                                        <Text color="gray.500" fontStyle="italic">No medical records found for this patient.</Text>
                                    </Box>
                                )}
                            </VStack>
                        </ModalBody>
                        <ModalFooter bg="gray.50" borderTopWidth="1px">
                            <HStack w="full" justify="space-between">
                                <Button
                                    leftIcon={<Icon as={FiDownload} />}
                                    colorScheme="teal"
                                    variant="solid"
                                    onClick={openPdfPreviewPage}
                                    isDisabled={!selectedHistory?.records?.length}
                                >
                                    Download PDF
                                </Button>
                                <Button variant="ghost" onClick={onClose}>Close</Button>
                            </HStack>
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
                            title={`Dr. ${user?.last_name || 'Medical Officer'}'s Station `}
                            description={`You have ${patientsQueue.length} appointments scheduled for today. ${patientsQueue.filter(p => p.status === 'waiting' || p.status === 'pending').length} patients are currently in the waiting area.`}
                        />

                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={8}>
                            <DoctorStatCard label="Patients Today" value={patientsQueue.length || "0"} icon={FiUsers} color="teal" onClick={() => handleCardClick('patients')} />
                            <DoctorStatCard
                                label="Consultations Done"
                                value={patientsQueue.filter(p => p.status === 'completed' || p.status === 'done').length.toString()}
                                icon={FiClipboard}
                                color="orange"
                                onClick={() => handleCardClick('consultations')}
                            />
                            <DoctorStatCard label="Pending Document Requests" value={documentRequests.length || "0"} icon={FiFileText} color="orange" onClick={() => handleCardClick('docs')} />
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
                                                    <Td>{formatSystemTime(p.appointment_time)}</Td>
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
                                                        <Button size="xs" colorScheme="teal" variant="ghost" onClick={() => handleViewHistory(p.user_id)}>View Details</Button>
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
                                                    <Td fontWeight="bold" color="teal.600">{formatUserId(p.id, 'Patient', p.created_at)}</Td>
                                                    <Td fontWeight="600">{p.first_name} {p.last_name}</Td>
                                                    <Td>{p.age} / {p.gender}</Td>
                                                    <Td>{p.contact_number}</Td>
                                                    <Td>{formatSystemDate(p.last_visit)}</Td>
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
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md" color="teal.800">Health Center Schedule</Heading>
                                <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full" fontSize="xs">
                                    Brgy. 174 Health Center
                                </Badge>
                            </Flex>

                            {/* Schedule Table */}
                            <Box overflowX="auto">
                                <Box as="table" w="full" style={{ borderCollapse: 'collapse' }}>
                                    <Box as="thead">
                                        <Box as="tr" bg="teal.50">
                                            <Box as="th" p={3} textAlign="left" fontSize="xs" fontWeight="bold" color="teal.700" textTransform="uppercase" letterSpacing="wide" borderBottom="2px solid" borderColor="teal.100">
                                                Service
                                            </Box>
                                            <Box as="th" p={3} textAlign="left" fontSize="xs" fontWeight="bold" color="teal.700" textTransform="uppercase" letterSpacing="wide" borderBottom="2px solid" borderColor="teal.100">
                                                Days
                                            </Box>
                                            <Box as="th" p={3} textAlign="left" fontSize="xs" fontWeight="bold" color="teal.700" textTransform="uppercase" letterSpacing="wide" borderBottom="2px solid" borderColor="teal.100">
                                                Hours
                                            </Box>
                                            <Box as="th" p={3} textAlign="left" fontSize="xs" fontWeight="bold" color="teal.700" textTransform="uppercase" letterSpacing="wide" borderBottom="2px solid" borderColor="teal.100">
                                                Status
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box as="tbody">
                                        {[
                                            { service: "General Consultation", days: "Mon – Fri", hours: "8:00 AM – 5:00 PM" },
                                            { service: "Dental Care", days: "Mon, Wed, Fri", hours: "8:00 AM – 5:00 PM" },
                                            { service: "Prenatal / Maternal", days: "Mon, Wed", hours: "8:00 AM – 12:00 PM" },
                                            { service: "Immunization", days: "Tue, Thu", hours: "8:00 AM – 12:00 PM" },
                                            { service: "Family Planning", days: "Tue, Thu", hours: "1:00 PM – 5:00 PM" },
                                            { service: "TB / DOTS", days: "Mon – Fri", hours: "1:00 PM – 3:00 PM" },
                                            { service: "Nutrition Counseling", days: "Wed, Fri", hours: "8:00 AM – 12:00 PM" },
                                            { service: "Cervical Cancer Screening", days: "First Fri of the month", hours: "8:00 AM – 12:00 PM" },
                                        ].map((row, i) => (
                                            <Box as="tr" key={i} _hover={{ bg: 'gray.50' }} transition="background 0.15s">
                                                <Box as="td" p={3} borderBottom="1px solid" borderColor="gray.100">
                                                    <Text fontWeight="semibold" fontSize="sm" color="gray.800">{row.service}</Text>
                                                </Box>
                                                <Box as="td" p={3} borderBottom="1px solid" borderColor="gray.100">
                                                    <Text fontSize="sm" color="gray.600">{row.days}</Text>
                                                </Box>
                                                <Box as="td" p={3} borderBottom="1px solid" borderColor="gray.100">
                                                    <Text fontSize="sm" color="gray.600">{row.hours}</Text>
                                                </Box>
                                                <Box as="td" p={3} borderBottom="1px solid" borderColor="gray.100">
                                                    <Badge colorScheme="teal" variant="subtle" fontSize="xs">Open</Badge>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>

                            <Box mt={5} p={3} bg="orange.50" borderRadius="xl" borderLeft="3px solid" borderColor="orange.300">
                                <Text fontSize="xs" color="orange.700" fontWeight="medium">
                                    Schedule is subject to change during holidays or special health programs. Contact administration for updates.
                                </Text>
                            </Box>
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
                                                    <Td>{formatSystemDate(r.appointment_date)}</Td>
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
                                                <Badge colorScheme={item.stock_quantity < 50 ? 'red' : 'orange'}>{item.stock_quantity} <Text as="span" fontSize="xs">{item.unit}</Text> left</Badge>
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
                                                <Th>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {inventory.length > 0 ? (
                                                inventory.map((item: any) => (
                                                    <Tr key={item.id}>
                                                        <Td fontWeight="600">{item.item_name}</Td>
                                                        <Td>{item.category}</Td>
                                                        <Td>
                                                            <HStack spacing={1}>
                                                                <Text fontWeight="700" color="gray.800">{item.stock_quantity}</Text>
                                                                <Text fontSize="xs" color="gray.400">{item.unit}</Text>
                                                            </HStack>
                                                        </Td>
                                                        <Td>
                                                            <HStack justify="space-between" align="center">
                                                                <Badge colorScheme={item.stock_quantity < 50 ? 'red' : item.stock_quantity < 100 ? 'orange' : 'green'}>
                                                                    {item.status || (item.stock_quantity < 50 ? 'Low Stock' : 'Good')}
                                                                </Badge>
                                                            </HStack>
                                                        </Td>
                                                        <Td>
                                                            <HStack justify="flex-end" spacing={2}>
                                                                <Button
                                                                    size="xs"
                                                                    variant="outline"
                                                                    colorScheme="gray"
                                                                    onClick={() => {
                                                                        setEditInventoryItem({ ...item, decrease_stock: 0 });
                                                                        onEditInventoryOpen();
                                                                    }}
                                                                >
                                                                    Edit
                                                                </Button>
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
                                                    <Td colSpan={5} textAlign="center" py={4} color="gray.500">
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

    // Full-page PDF Editor/Preview — replaces the dashboard temporarily
    if (pdfPreviewPageData) {
        return (
            <PDFPreviewPage
                patient={pdfPreviewPageData.patient}
                records={pdfPreviewPageData.records}
                onBack={() => setPdfPreviewPageData(null)}
            />
        );
    }

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
                            BHCare <Text as="span" color="orange.500" fontSize="xs">Doctor</Text>
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
                        Log out
                    </NavItem>
                </Box>
            </Box>

            {/* Main Content Area */}
            <Box ml={{ base: 0, md: '280px' }} p={{ base: 6, md: 10 }} position="relative" maxW={{ base: "100%", md: "calc(100vw - 280px)" }} overflowX="hidden">
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

            <Modal isOpen={isOpen} onClose={onClose} size={['docs', 'patients', 'consultations', 'history-view', 'soap-form'].includes(selectedCard as string) ? '6xl' : 'xl'} isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent
                    borderRadius={['docs', 'patients', 'consultations', 'history-view', 'soap-form'].includes(selectedCard as string) ? '3xl' : 'md'}
                    overflow="hidden"
                    bg="white"
                    boxShadow="xl"
                >
                    <ModalCloseButton mt={['docs', 'patients', 'consultations', 'history-view', 'soap-form'].includes(selectedCard as string) ? 2 : 0} zIndex={20} color={selectedCard === 'soap-form' ? 'white' : 'inherit'} />
                    {renderModalContent()}
                </ModalContent>
            </Modal>

            {/* Add Inventory Modal */}
            <Modal isOpen={isAddInventoryOpen} onClose={onAddInventoryClose} isCentered>
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                        Add New Inventory Item
                    </ModalHeader>
                    <ModalCloseButton mt={2} />
                    <ModalBody py={6}>
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
                                    <Text mb={1} fontSize="sm" fontWeight="bold">Initial Stock <Text as="span" color="gray.400" fontWeight="normal">(max {MAX_STOCK})</Text></Text>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={MAX_STOCK}
                                        value={newInventoryItem.stock_quantity}
                                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, stock_quantity: parseInt(e.target.value) || 0 })}
                                        borderColor={newInventoryItem.stock_quantity > MAX_STOCK ? 'red.400' : undefined}
                                    />
                                    {newInventoryItem.stock_quantity > MAX_STOCK && (
                                        <Text color="red.500" fontSize="xs" mt={1}>Exceeds maximum stock of {MAX_STOCK}</Text>
                                    )}
                                </Box>
                                <Box w="full">
                                    <Text mb={1} fontSize="sm" fontWeight="bold">Unit</Text>
                                    <select
                                        className="chakra-select css-1"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}
                                        value={newInventoryItem.unit}
                                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, unit: e.target.value })}
                                    >
                                        <option value="" disabled>Select unit</option>
                                        <option value="pcs">pcs</option>
                                        <option value="boxes">boxes</option>
                                        <option value="bottles">bottles</option>
                                        <option value="packs">packs</option>
                                        <option value="vials">vials</option>
                                        <option value="tablets">tablets</option>
                                        <option value="capsules">capsules</option>
                                        <option value="tubes">tubes</option>
                                    </select>
                                </Box>
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTopWidth="1px">
                        <Button variant="ghost" mr={3} onClick={onAddInventoryClose}>Cancel</Button>
                        <Button colorScheme="teal" onClick={handleAddInventoryItem} isDisabled={newInventoryItem.stock_quantity > MAX_STOCK}>Add Item</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Restock Inventory Modal */}
            <Modal isOpen={isRestockOpen} onClose={onRestockClose} size="sm" isCentered>
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                        Restock Item
                    </ModalHeader>
                    <ModalCloseButton mt={2} />
                    <ModalBody py={6}>
                        <VStack spacing={4}>
                            <Box w="full">
                                {(() => {
                                    const currentItem = inventory.find((item: any) => item.id === restockItemId);
                                    const currentStock = currentItem ? currentItem.stock_quantity : 0;
                                    const newTotal = currentStock + restockQuantity;
                                    const wouldExceed = newTotal > MAX_STOCK;
                                    return (
                                        <>
                                            <Text mb={1} fontSize="sm" fontWeight="bold">Quantity to Add</Text>
                                            {currentItem && (
                                                <Text fontSize="xs" color="gray.500" mb={2}>
                                                    Current stock: <Text as="span" fontWeight="bold" color="teal.600">{currentStock} {currentItem.unit}</Text>
                                                    {' · '}Max allowed: <Text as="span" fontWeight="bold">{MAX_STOCK}</Text>
                                                    {' · '}Can add up to: <Text as="span" fontWeight="bold" color="green.600">{Math.max(0, MAX_STOCK - currentStock)}</Text>
                                                </Text>
                                            )}
                                            <Input
                                                type="number"
                                                min={1}
                                                max={currentItem ? Math.max(0, MAX_STOCK - currentItem.stock_quantity) : MAX_STOCK}
                                                value={restockQuantity === 0 ? '' : restockQuantity}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setRestockQuantity(val === '' ? 0 : parseInt(val));
                                                }}
                                                placeholder="Enter quantity"
                                                borderColor={wouldExceed ? 'red.400' : undefined}
                                            />
                                            {wouldExceed && (
                                                <Text color="red.500" fontSize="xs" mt={1}>
                                                    Adding {restockQuantity} would bring total to {newTotal}, exceeding the limit of {MAX_STOCK}.
                                                </Text>
                                            )}
                                        </>
                                    );
                                })()}
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTopWidth="1px">
                        <Button variant="ghost" mr={3} onClick={onRestockClose}>Cancel</Button>
                        <Button
                            colorScheme="teal"
                            onClick={confirmRestockItem}
                            isDisabled={(() => {
                                const currentItem = inventory.find((item: any) => item.id === restockItemId);
                                const currentStock = currentItem ? currentItem.stock_quantity : 0;
                                return (currentStock + restockQuantity) > MAX_STOCK || restockQuantity <= 0;
                            })()}
                        >
                            Confirm Restock
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Edit Inventory Modal */}
            <Modal isOpen={isEditInventoryOpen} onClose={onEditInventoryClose} isCentered>
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                        Edit Item
                    </ModalHeader>
                    <ModalCloseButton mt={2} />
                    <ModalBody py={6}>
                        <VStack spacing={4}>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Item Name</Text>
                                <Input
                                    value={editInventoryItem?.item_name || ''}
                                    onChange={(e) => setEditInventoryItem((prev: any) => ({ ...(prev || {}), item_name: e.target.value }))}
                                    placeholder="e.g. Paracetamol 500mg"
                                />
                            </Box>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Category</Text>
                                <select
                                    className="chakra-select css-1"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}
                                    value={editInventoryItem?.category || 'Medicine'}
                                    onChange={(e) => setEditInventoryItem((prev: any) => ({ ...(prev || {}), category: e.target.value }))}
                                >
                                    <option value="Medicine">Medicine</option>
                                    <option value="Supplies">Supplies</option>
                                    <option value="Equipment">Equipment</option>
                                </select>
                            </Box>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Unit</Text>
                                <select
                                    className="chakra-select css-1"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}
                                    value={editInventoryItem?.unit || ''}
                                    onChange={(e) => setEditInventoryItem((prev: any) => ({ ...(prev || {}), unit: e.target.value }))}
                                >
                                    <option value="" disabled>Select unit</option>
                                    <option value="pcs">pcs</option>
                                    <option value="boxes">boxes</option>
                                    <option value="bottles">bottles</option>
                                    <option value="packs">packs</option>
                                    <option value="vials">vials</option>
                                    <option value="tablets">tablets</option>
                                    <option value="capsules">capsules</option>
                                    <option value="tubes">tubes</option>
                                </select>
                            </Box>
                            <Box w="full" p={3} bg="red.50" borderRadius="lg" border="1px solid" borderColor="red.100">
                                <Text mb={1} fontSize="sm" fontWeight="bold" color="red.700">Decrease Stock</Text>
                                <Text fontSize="xs" color="gray.500" mb={2}>
                                    Current stock: <Text as="span" fontWeight="bold" color="teal.600">{editInventoryItem?.stock_quantity ?? 0} {editInventoryItem?.unit}</Text>
                                    {' · '}Leave at 0 to keep unchanged.
                                </Text>
                                <Input
                                    type="number"
                                    min={0}
                                    max={editInventoryItem?.stock_quantity ?? 0}
                                    value={editInventoryItem?.decrease_stock === undefined || editInventoryItem?.decrease_stock === 0 ? '' : editInventoryItem.decrease_stock}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setEditInventoryItem((prev: any) => ({ ...(prev || {}), decrease_stock: val === '' ? 0 : parseInt(val) }));
                                    }}
                                    placeholder="Amount to remove (optional)"
                                    bg="white"
                                    borderColor={(editInventoryItem?.decrease_stock || 0) > (editInventoryItem?.stock_quantity || 0) ? 'red.400' : undefined}
                                />
                                {(editInventoryItem?.decrease_stock || 0) > (editInventoryItem?.stock_quantity || 0) && (
                                    <Text color="red.500" fontSize="xs" mt={1}>
                                        ⚠ Cannot exceed current stock of {editInventoryItem?.stock_quantity}.
                                    </Text>
                                )}
                                {(editInventoryItem?.decrease_stock || 0) > 0 && (editInventoryItem?.decrease_stock || 0) <= (editInventoryItem?.stock_quantity || 0) && (
                                    <Text color="orange.600" fontSize="xs" mt={1} fontWeight="600">
                                        Stock will be reduced from {editInventoryItem?.stock_quantity} → {editInventoryItem.stock_quantity - editInventoryItem.decrease_stock}
                                    </Text>
                                )}
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTopWidth="1px">
                        <Button variant="ghost" mr={3} onClick={() => { onEditInventoryClose(); setEditInventoryItem(null); }}>Cancel</Button>
                        <Button colorScheme="teal" onClick={confirmUpdateInventoryItem}>Save Changes</Button>
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
                                        BHCare <Text as="span" color="orange.500" fontSize="xs">Doctor</Text>
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
                                    Log out
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
