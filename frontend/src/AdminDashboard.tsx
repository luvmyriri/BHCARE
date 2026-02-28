import React, { useState, useEffect } from 'react';
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
    Select,
    useToast,
    Input,
    InputGroup,
    InputLeftElement,
    FormControl,
    FormLabel
} from '@chakra-ui/react';
import {
    FiGrid,
    FiUsers,
    FiCalendar,
    FiLogOut,
    FiActivity,
    FiBarChart2,
    FiShield,
    FiAlertTriangle,
    FiMenu,
    FiSearch,
    FiUser,
    FiUserPlus,
    FiRefreshCw,
    FiFileText,
    FiMessageSquare
} from 'react-icons/fi';
import {
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Progress,
    Spinner,
} from '@chakra-ui/react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
    user: any;
    onLogout: () => void;
}

// ── Export Utilities ────────────────────────────────────────────────────────

/** Generic CSV download */
const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
};

/** Generic PDF download using jsPDF + autoTable */
const downloadPDF = (filename: string, title: string, headers: string[], rows: (string | number)[][]) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text(title, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Brgy. 174 Health Center  ·  Generated: ${new Date().toLocaleString()}`, 14, 23);
    autoTable(doc, {
        head: [headers],
        body: rows.map(r => r.map(c => String(c ?? ''))),
        startY: 28,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [0, 128, 128], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 250, 250] },
    });
    doc.save(filename);
};

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

const AdminStatCard = ({ label, value, icon, color, onClick }: any) => (
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
            as={FiShield}
            position="absolute"
            right="-20px"
            bottom="-20px"
            boxSize={{ base: "150px", md: "200px" }}
            opacity={0.15}
            transform="rotate(-15deg)"
        />
    </Box>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
    const [selectedCard, setSelectedCard] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [medicalStaff, setMedicalStaff] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [contactTickets, setContactTickets] = useState<any[]>([]);
    const [ticketFilter, setTicketFilter] = useState<'open' | 'resolved'>('open');


    // Search and Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('name-asc');
    const [staffSearchQuery, setStaffSearchQuery] = useState('');
    const [staffSortOrder, setStaffSortOrder] = useState('name-asc');
    const [aptSearchQuery, setAptSearchQuery] = useState('');
    const [aptSortOrder, setAptSortOrder] = useState('time-asc');

    // User Management State
    const [editUser, setEditUser] = useState<any>(null);
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        role: 'Patient',
        // Patient detail fields
        date_of_birth: '',
        gender: '',
        full_address: '',
        barangay: '',
        city: '',
        // Medical Staff Fields
        prc_license_number: '',
        specialization: '',
        schedule: '',
        clinic_room: '',
        status: 'Active'
    });

    // Dashboard Statistics State
    const [stats, setStats] = useState({
        total_users: 0,
        active_doctors: 0,
        todays_appointments: 0,
        system_health: 'Good'
    });

    const [systemStats, setSystemStats] = useState({
        database_connection: 'Checking...',
        uptime: 'Calculating...',
        last_backup: 'Checking...',
        api_latency: 'Checking...'
    });

    // Recent Activities State
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    // Selected Activity for Modal
    const [selectedActivity, setSelectedActivity] = useState<any>(null);

    // Analytics State
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [predictiveData, setPredictiveData] = useState<any>(null);
    const [predictiveLoading, setPredictiveLoading] = useState(false);

    // Auto-refresh State
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleViewActivity = (activity: any) => {
        setSelectedActivity(activity);
    };

    // Add Staff State
    const { isOpen: isAddStaffOpen, onOpen: onAddStaffOpen, onClose: onAddStaffClose } = useDisclosure();
    const [newStaff, setNewStaff] = useState({
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        role: 'Doctor',
        prc_license_number: '',
        specialization: '',
        schedule: '',
        clinic_room: '',
        password: ''
    });

    const toast = useToast();
    const [resendCooldowns, setResendCooldowns] = React.useState<Record<number, number>>({});

    const handleResendCredentials = async (staffId: number) => {
        const now = Date.now();
        const lastSent = resendCooldowns[staffId] || 0;
        const secondsLeft = Math.ceil((60000 - (now - lastSent)) / 1000);
        if (now - lastSent < 60000) {
            toast({ title: 'Please wait', description: `Resend available in ${secondsLeft}s`, status: 'warning', duration: 3000 });
            return;
        }
        try {
            const res = await fetch(`/api/admin/medical-staff/${staffId}/resend-password`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                setResendCooldowns(prev => ({ ...prev, [staffId]: now }));
                toast({ title: 'Credentials Resent', description: 'A new temporary password has been emailed.', status: 'success', duration: 3000 });
            } else if (res.status === 429) {
                toast({ title: 'Cooldown Active', description: data.error, status: 'warning', duration: 4000 });
            } else {
                toast({ title: 'Error', description: data.error || 'Failed to resend credentials.', status: 'error', duration: 4000 });
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to resend credentials.', status: 'error', duration: 4000 });
        }
    };

    // Fetch Users
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                // Update stats
                setStats(prev => ({ ...prev, total_users: data.length }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Fetch Medical Staff (for verifying active doctors count)
    const fetchMedicalStaff = async () => {
        try {
            const response = await fetch('/api/admin/medical-staff');
            if (response.ok) {
                const data = await response.json();
                setMedicalStaff(data);
                // Count active doctors/staff
                const activeCount = data.filter((s: any) => s.role === 'Doctor').length;
                setStats(prev => ({ ...prev, active_doctors: activeCount }));
            }
        } catch (error) {
            console.error('Error fetching medical staff:', error);
        }
    };

    // Fetch Today's Appointments
    const fetchAppointments = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`/api/appointments?date=${today}`);
            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
                setStats(prev => ({ ...prev, todays_appointments: data.length }));
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    // Fetch System Stats
    const fetchSystemStats = async () => {
        try {
            const start = performance.now();
            const response = await fetch('/api/admin/system-stats');
            const end = performance.now();
            const latency = Math.round(end - start) + 'ms';

            if (response.ok) {
                const data = await response.json();
                setSystemStats({
                    ...data,
                    api_latency: latency
                });
                // Update system health card based on DB connection
                if (data.database_connection !== 'Stable') {
                    setStats(prev => ({ ...prev, system_health: 'Critical' }));
                }
            }
        } catch (error) {
            console.error('Error fetching system stats:', error);
            setSystemStats(prev => ({ ...prev, database_connection: 'Error', api_latency: 'Error' }));
        }
    };

    // Fetch Analytics
    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const res = await fetch('/api/admin/analytics');
            if (res.ok) {
                const data = await res.json();
                setAnalyticsData(data);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    // Fetch Predictive Insights
    const fetchPredictiveInsights = async () => {
        setPredictiveLoading(true);
        try {
            const res = await fetch('/api/admin/predictive-insights');
            if (res.ok) {
                const data = await res.json();
                setPredictiveData(data);
            }
        } catch (err) {
            console.error('Error fetching predictive insights:', err);
        } finally {
            setPredictiveLoading(false);
        }
    };

    // Trigger analytics fetch when tab opens
    useEffect(() => {
        if (activeTab === 'analytics') {
            if (!analyticsData) fetchAnalytics();
            if (!predictiveData) fetchPredictiveInsights();
        }
    }, [activeTab]);

    // Fetch Activities
    const fetchActivities = async () => {
        try {
            const r = await fetch('/api/admin/activities');
            const data = await r.json();
            if (Array.isArray(data)) setRecentActivities(data);
        } catch {
            // keep existing data on network error
        }
    };

    // Fetch Contact Tickets
    const fetchContactTickets = async () => {
        try {
            const res = await fetch('/api/contact/tickets');
            if (res.ok) {
                const data = await res.json();
                setContactTickets(data);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const handleResolveTicket = async (id: number) => {
        try {
            const res = await fetch(`/api/contact/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Resolved' })
            });
            if (res.ok) {
                toast({ title: 'Ticket Resolved', status: 'success', duration: 3000 });
                fetchContactTickets();
            } else {
                toast({ title: 'Error', description: 'Could not resolve ticket', status: 'error', duration: 3000 });
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Refresh all live data
    const refreshAll = async (showSpinner = false) => {
        if (showSpinner) setIsRefreshing(true);
        await Promise.all([
            fetchUsers(),
            fetchMedicalStaff(),
            fetchAppointments(),
            fetchSystemStats(),
            fetchActivities(),
            fetchContactTickets()
        ]);
        setLastUpdated(new Date());
        if (showSpinner) setIsRefreshing(false);
    };

    // Initial load + 30-second polling interval
    React.useEffect(() => {
        refreshAll(true);
        const interval = setInterval(() => refreshAll(false), 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAddStaff = async () => {
        try {
            const response = await fetch('/api/admin/medical-staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStaff)
            });

            if (response.ok) {
                toast({ title: "Success", description: "Medical staff account created.", status: "success" });
                onAddStaffClose();
                fetchMedicalStaff();
                fetchUsers();
                setNewStaff({
                    first_name: '', last_name: '', email: '', contact_number: '',
                    role: 'Doctor', prc_license_number: '', specialization: '',
                    schedule: '', clinic_room: '', password: ''
                });
            } else {
                const data = await response.json();
                toast({ title: "Error", description: data.error, status: "error" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to create account.", status: "error" });
        }
    };

    const handleEditClick = (user: any) => {
        setEditUser(user);
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            contact_number: user.contact_number || '',
            role: user.role || 'Patient',
            date_of_birth: user.date_of_birth || '',
            gender: user.gender || '',
            full_address: user.full_address || '',
            barangay: user.barangay || '',
            city: user.city || '',
            prc_license_number: user.prc_license_number || '',
            specialization: user.specialization || '',
            schedule: user.schedule || '',
            clinic_room: user.clinic_room || '',
            status: user.status || 'Active'
        });
        onEditOpen();
    };

    const handleUpdateUser = async () => {
        if (!editUser) return;

        try {
            const response = await fetch(`/user/${editUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onEditClose();
                fetchUsers(); // Refresh users list
                if (activeTab === 'doctors') {
                    fetchMedicalStaff(); // Refresh medical staff list if on that tab
                }
                toast({
                    title: "Success",
                    description: "User details updated successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                const errorData = await response.json();
                toast({
                    title: "Update failed.",
                    description: errorData.error || "Please try again.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast({
                title: "Network error.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };


    const handleCardClick = (card: string) => {
        setSelectedCard(card);
        onOpen();
    };

    const renderModalContent = () => {
        switch (selectedCard) {
            case 'users':
                const residentsCount = users.filter((u: any) => u.barangay === 'Brgy 174' || u.barangay === 'Brgy. 174').length;
                const nonResidentsCount = users.length - residentsCount;

                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <HStack align="center" spacing={3}>
                                <Icon as={FiUsers} boxSize={6} />
                                <Text>Users Details</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            <VStack align="stretch" spacing={4}>
                                <Text fontWeight="bold" fontSize="md" color="gray.700">Total Users Breakdown</Text>
                                <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                    <Table variant="simple" size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={3}>Category</Th>
                                                <Th py={3} isNumeric>Count</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            <Tr><Td py={3}>Residents (Barangay 174)</Td><Td py={3} isNumeric>{residentsCount}</Td></Tr>
                                            <Tr><Td py={3}>Non-Residents</Td><Td py={3} isNumeric>{nonResidentsCount}</Td></Tr>
                                            <Tr bg="teal.50"><Td py={3} fontWeight="bold" color="teal.800">Total</Td><Td py={3} isNumeric fontWeight="bold" color="teal.800">{users.length}</Td></Tr>
                                        </Tbody>
                                    </Table>
                                </Box>
                            </VStack>
                        </ModalBody>
                    </>
                );
            case 'doctors':
                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <HStack align="center" spacing={3}>
                                <Icon as={FiActivity} boxSize={6} />
                                <Text>Doctors Details</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            <VStack align="stretch" spacing={4}>
                                <Text fontWeight="bold" fontSize="md" color="gray.700">Active Medical Staff</Text>
                                <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                    <Table variant="simple" size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={3}>Name</Th>
                                                <Th py={3}>Role</Th>
                                                <Th py={3}>Status</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {medicalStaff.length > 0 ? (
                                                medicalStaff.map((staff: any) => (
                                                    <Tr key={staff.id}>
                                                        <Td py={3} fontWeight="500">{staff.first_name} {staff.last_name}</Td>
                                                        <Td py={3} color="gray.600">{staff.specialization || staff.role}</Td>
                                                        <Td py={3}><Badge colorScheme="green" borderRadius="full" px={2}>Active</Badge></Td>
                                                    </Tr>
                                                ))
                                            ) : (
                                                <Tr><Td colSpan={3} py={5} textAlign="center" color="gray.500">No medical staff found.</Td></Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </VStack>
                        </ModalBody>
                    </>
                );
            case 'appointments': {
                const filteredAppointments = appointments.filter(a =>
                    (a.first_name ? `${a.first_name} ${a.last_name}` : 'Walk-in').toLowerCase().includes(aptSearchQuery.toLowerCase()) ||
                    (a.service_type || '').toLowerCase().includes(aptSearchQuery.toLowerCase())
                ).sort((a, b) => {
                    if (aptSortOrder === 'time-asc') return (a.appointment_time || '').localeCompare(b.appointment_time || '');
                    if (aptSortOrder === 'time-desc') return (b.appointment_time || '').localeCompare(a.appointment_time || '');
                    return 0;
                });

                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                                <HStack align="center" spacing={3}>
                                    <Icon as={FiCalendar} boxSize={6} />
                                    <Text>Appointments Details</Text>
                                </HStack>
                                <HStack>
                                    <InputGroup w={{ base: "full", md: "200px" }} size="sm" bg="white" borderRadius="md">
                                        <InputLeftElement pointerEvents="none"><FiSearch color="gray.300" /></InputLeftElement>
                                        <Input placeholder="Search patient..." value={aptSearchQuery} onChange={(e) => setAptSearchQuery(e.target.value)} />
                                    </InputGroup>
                                    <Select w="150px" size="sm" bg="white" value={aptSortOrder} onChange={(e) => setAptSortOrder(e.target.value)}>
                                        <option value="time-asc">Earliest First</option>
                                        <option value="time-desc">Latest First</option>
                                    </Select>
                                </HStack>
                            </Flex>
                        </ModalHeader>
                        <ModalBody py={6}>
                            <VStack align="stretch" spacing={4}>
                                <Text fontWeight="bold" fontSize="md" color="gray.700">Today's Appointments</Text>
                                <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                    <Table variant="simple" size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={3}>Time</Th>
                                                <Th py={3}>Patient</Th>
                                                <Th py={3}>Type</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredAppointments.length > 0 ? (
                                                filteredAppointments.map((apt: any) => (
                                                    <Tr key={apt.id}>
                                                        <Td py={3} fontWeight="500">{apt.appointment_time || 'N/A'}</Td>
                                                        <Td py={3}>{apt.first_name ? `${apt.first_name} ${apt.last_name}` : 'Walk-in'}</Td>
                                                        <Td py={3} color="gray.600">{apt.service_type}</Td>
                                                    </Tr>
                                                ))
                                            ) : (
                                                <Tr><Td colSpan={3} py={5} textAlign="center" color="gray.500">No appointments for today.</Td></Tr>
                                            )}
                                        </Tbody>
                                    </Table>
                                </Box>
                                <Box mt={2}>
                                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                        Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                                    </Text>
                                </Box>
                            </VStack>
                        </ModalBody>
                    </>
                );
            }
            case 'system':
                return (
                    <>
                        <ModalHeader>System Health Status</ModalHeader>
                        <ModalBody>
                            <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between">
                                    <Text>Database Connection</Text>
                                    <Badge colorScheme={systemStats.database_connection === 'Stable' ? 'green' : 'red'}>
                                        {systemStats.database_connection}
                                    </Badge>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>API Latency</Text>
                                    <Text fontSize="sm">{systemStats.api_latency}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>Server Uptime</Text>
                                    <Text fontSize="sm">{systemStats.uptime}</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>Last Backup</Text>
                                    <Text fontSize="sm">{systemStats.last_backup}</Text>
                                </HStack>
                            </VStack>
                        </ModalBody>
                    </>
                );
            case 'activity':
                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <HStack align="center" spacing={3}>
                                <Icon as={FiActivity} boxSize={6} />
                                <Text>Activity Details</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            {selectedActivity ? (
                                <VStack align="stretch" spacing={5}>
                                    <Box p={4} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                        <Text fontWeight="bold" color="teal.600" fontSize="xs" textTransform="uppercase" letterSpacing="wider">User</Text>
                                        <Text fontSize="lg" fontWeight="600" color="gray.800" mt={1}>{selectedActivity.user}</Text>
                                    </Box>
                                    <Box p={4} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                        <Text fontWeight="bold" color="teal.600" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Action Taken</Text>
                                        <Text fontSize="md" color="gray.700" mt={1}>{selectedActivity.action}</Text>
                                    </Box>
                                    <HStack spacing={4}>
                                        <Box flex={1} p={4} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                            <Text fontWeight="bold" color="teal.600" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Type</Text>
                                            <Badge mt={2} colorScheme={
                                                selectedActivity.type === 'UPDATE' ? 'blue' :
                                                    selectedActivity.type === 'NEW' ? 'green' :
                                                        selectedActivity.type === 'COMPLETE' ? 'orange' :
                                                            selectedActivity.type === 'COMPLETED' ? 'orange' : 'gray'
                                            } borderRadius="full" px={3} py={1}>{selectedActivity.type}</Badge>
                                        </Box>
                                        <Box flex={1} p={4} bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                            <Text fontWeight="bold" color="teal.600" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Timestamp</Text>
                                            <Text mt={2} fontSize="sm" color="gray.700" fontWeight="500">{selectedActivity.time}</Text>
                                        </Box>
                                    </HStack>
                                    <Box p={4} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.200">
                                        <Text fontWeight="bold" color="teal.600" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Additional Details</Text>
                                        <Text mt={2} fontSize="sm" color="gray.700">{selectedActivity.details || 'No further details available for this activity log.'}</Text>
                                    </Box>
                                </VStack>
                            ) : (
                                <Box py={10} textAlign="center">
                                    <Icon as={FiAlertTriangle} boxSize={10} color="gray.400" mb={3} />
                                    <Text color="gray.500">No activity selected.</Text>
                                </Box>
                            )}
                        </ModalBody>
                    </>
                );
            case 'prenatal':
                return (
                    <>
                        <ModalHeader>Prenatal Care Details</ModalHeader>
                        <ModalBody>
                            <Text mb={4} fontSize="sm" color="gray.600">Patients with prenatal appointments recorded in the system.</Text>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Patient</Th><Th>Service</Th><Th>Date</Th></Tr></Thead>
                                    <Tbody>
                                        {analyticsData?.prenatal?.patients?.length > 0 ? (
                                            analyticsData.prenatal.patients.map((p: any, i: number) => (
                                                <Tr key={i}>
                                                    <Td fontWeight="600">{p.patient_name}</Td>
                                                    <Td>{p.service_type}</Td>
                                                    <Td>{p.appointment_date}</Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr><Td colSpan={3} textAlign="center" color="gray.400">No prenatal appointments recorded yet.</Td></Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                    </>
                );
            case 'immunization':
                return (
                    <>
                        <ModalHeader>Immunization Breakdown</ModalHeader>
                        <ModalBody>
                            <Text mb={3} fontSize="sm" color="gray.600">Total appointments by vaccine type.
                            </Text>
                            <VStack align="stretch" spacing={3}>
                                {analyticsData?.immunization?.breakdown ? (
                                    Object.entries(analyticsData.immunization.breakdown)
                                        .filter(([, v]) => (v as number) > 0)
                                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                                        .map(([vaccine, count]: [string, any], i) => {
                                            const colors = ['green', 'orange', 'teal', 'blue', 'purple', 'pink'];
                                            const total = analyticsData.immunization.count || 1;
                                            const pct = Math.min(100, Math.round((count / total) * 100));
                                            return (
                                                <Box key={i}>
                                                    <Flex justify="space-between" mb={1}>
                                                        <Text fontSize="sm" fontWeight="bold">{vaccine}</Text>
                                                        <Text fontSize="xs" color="gray.500">{count} appointments</Text>
                                                    </Flex>
                                                    <Progress value={pct} size="sm" colorScheme={colors[i % colors.length]} />
                                                    <Text fontSize="xs" textAlign="right" mt={1}>{pct}% of total</Text>
                                                </Box>
                                            );
                                        })
                                ) : (
                                    <Text color="gray.400" textAlign="center">No immunization data available yet.</Text>
                                )}
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
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="ADMIN CONTROL"
                            title={`Welcome, ${user?.first_name || 'Administrator'} 🛡️`}
                            description="Complete system oversight and management. Monitor all health center operations, user activities."
                        />

                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={8}>
                            <AdminStatCard
                                label="Total Users"
                                value={stats.total_users}
                                icon={FiUsers}
                                color="teal"
                                onClick={() => handleCardClick('users')}
                            />
                            <AdminStatCard label="Active Doctors" value={stats.active_doctors} icon={FiActivity} color="orange" onClick={() => handleCardClick('doctors')} />
                            <AdminStatCard label="Today's Appointments" value={stats.todays_appointments} icon={FiCalendar} color="blue" onClick={() => handleCardClick('appointments')} />
                        </SimpleGrid>

                        <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6}>
                                <HStack spacing={3}>
                                    <Heading size="md" color="teal.800">Recent System Activities</Heading>
                                    <HStack spacing={1} align="center">
                                        <Box
                                            w="8px" h="8px" borderRadius="full" bg="green.400"
                                            sx={{
                                                animation: 'pulse-dot 2s infinite',
                                                '@keyframes pulse-dot': {
                                                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                                                    '50%': { opacity: 0.4, transform: 'scale(0.7)' },
                                                },
                                            }}
                                        />
                                        <Text fontSize="xs" color="green.500" fontWeight="600">LIVE</Text>
                                    </HStack>
                                </HStack>
                                <HStack spacing={3}>
                                    {lastUpdated && (
                                        <Text fontSize="xs" color="gray.400">
                                            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </Text>
                                    )}
                                    <Button
                                        size="sm" colorScheme="teal" variant="ghost"
                                        leftIcon={isRefreshing ? <Spinner size="xs" /> : <FiActivity />}
                                        onClick={() => refreshAll(true)}
                                        isLoading={isRefreshing}
                                        loadingText="Refreshing"
                                    >
                                        Refresh
                                    </Button>
                                    <Button size="sm" colorScheme="orange" variant="outline" leftIcon={<FiBarChart2 />}>View All Logs</Button>
                                </HStack>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>User/System</Th>
                                            <Th>Action</Th>
                                            <Th>Time</Th>
                                            <Th>Type</Th>
                                            <Th>Details</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {recentActivities.map((activity, index) => (
                                            <Tr key={index}>
                                                <Td fontWeight="bold">{activity.user}</Td>
                                                <Td>{activity.action}</Td>
                                                <Td color="gray.500" fontSize="sm">{activity.time}</Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={
                                                            activity.type === 'UPDATE' ? 'blue' :
                                                                activity.type === 'NEW' ? 'green' :
                                                                    activity.type === 'COMPLETE' ? 'orange' :
                                                                        activity.type === 'COMPLETED' ? 'orange' : 'gray'
                                                        }
                                                    >
                                                        {activity.type}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <Button size="xs" colorScheme="gray" variant="outline" onClick={() => { handleCardClick('activity'); handleViewActivity(activity); }}>View</Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );
            case 'users': {
                const filteredUsers = users.filter(u =>
                    u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).sort((a, b) => {
                    if (sortOrder === 'name-asc') return a.first_name.localeCompare(b.first_name);
                    if (sortOrder === 'name-desc') return b.first_name.localeCompare(a.first_name);
                    if (sortOrder === 'role') return a.role.localeCompare(b.role);
                    if (sortOrder === 'date') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
                    return 0;
                });

                // Helper to format User IDs by role
                const formatUserId = (id: number | string, role: string, createdAt: string) => {
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

                return (
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="USER MANAGEMENT"
                            title="System Users & Permissions"
                            description="Manage all user accounts, roles, and access permissions for doctors, staff, and patients."
                        />
                        <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
                                <Heading size="md" color="teal.800">Registered Users</Heading>
                                <HStack>
                                    <InputGroup w={{ base: "full", md: "250px" }}>
                                        <InputLeftElement pointerEvents="none"><FiSearch color="gray.300" /></InputLeftElement>
                                        <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                    </InputGroup>
                                    <Select w="150px" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                        <option value="name-asc">Name (A-Z)</option>
                                        <option value="name-desc">Name (Z-A)</option>
                                        <option value="role">Role</option>
                                        <option value="date">Date Joined</option>
                                    </Select>
                                    <Button size="sm" colorScheme="orange" leftIcon={<FiActivity />} onClick={fetchUsers}>Refresh List</Button>
                                    <Button
                                        size="sm" colorScheme="red" variant="outline"
                                        leftIcon={<Icon as={FiFileText} />}
                                        onClick={() => {
                                            const headers = ['First Name', 'Last Name', 'Email', 'Date Joined'];
                                            const rows = filteredUsers.map((u: any) => [
                                                u.first_name, u.last_name, u.email,
                                                u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
                                            ]);
                                            downloadPDF('users_report.pdf', 'Registered Users Report', headers, rows);
                                        }}
                                    >
                                        PDF
                                    </Button>
                                    <Button
                                        size="sm" colorScheme="green" variant="outline"
                                        leftIcon={<Icon as={FiFileText} />}
                                        onClick={() => {
                                            const headers = ['First Name', 'Last Name', 'Email', 'Date Joined'];
                                            const rows = filteredUsers.map((u: any) => [
                                                u.first_name, u.last_name, u.email,
                                                u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
                                            ]);
                                            downloadCSV('users_report.csv', headers, rows);
                                        }}
                                    >
                                        CSV
                                    </Button>
                                </HStack>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>User ID</Th>
                                            <Th>Name</Th>
                                            <Th>Email</Th>
                                            <Th>Role</Th>
                                            <Th>Joined</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <Tr key={user.id}>
                                                    <Td><code style={{ fontSize: '0.8em', background: '#f7fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#4a5568', fontWeight: 600 }}>{formatUserId(user.id, user.role, user.created_at)}</code></Td>
                                                    <Td fontWeight="600">{user.first_name} {user.last_name}</Td>
                                                    <Td>{user.email}</Td>
                                                    <Td>
                                                        <Badge colorScheme={(user.role || '').toLowerCase().includes('admin') ? 'red' : (user.role || '').toLowerCase().includes('medic') || (user.role || '').toLowerCase().includes('staff') ? 'blue' : (user.role || '').toLowerCase().includes('doctor') ? 'purple' : 'green'}>
                                                            {(user.role || 'Patient').toLowerCase().includes('admin') ? 'Administrator' : user.role}
                                                        </Badge>
                                                    </Td>
                                                    <Td>{user.created_at || 'N/A'}</Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            {(user?.role || '').toLowerCase().includes('super') ? (
                                                                <Button size="xs" colorScheme="blue" variant="ghost" onClick={() => handleEditClick(user)}>Edit</Button>
                                                            ) : (
                                                                <Button size="xs" colorScheme="gray" variant="outline" onClick={() => handleEditClick(user)}>View</Button>
                                                            )}
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={6} textAlign="center">No users found.</Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );
            }
            case 'doctors': {
                const filteredStaff = medicalStaff.filter(s =>
                    s.first_name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                    s.last_name.toLowerCase().includes(staffSearchQuery.toLowerCase())
                ).sort((a, b) => {
                    if (staffSortOrder === 'name-asc') return a.first_name.localeCompare(b.first_name);
                    if (staffSortOrder === 'name-desc') return b.first_name.localeCompare(a.first_name);
                    if (staffSortOrder === 'role') return (a.specialization || a.role).localeCompare(b.specialization || b.role);
                    return 0;
                });

                return (
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="MEDICAL STAFF"
                            title="Doctor & Staff Registry"
                            description="View and manage all medical professionals, their schedules, and performance metrics."
                        />

                        <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
                                <Heading size="md" color="teal.800">Medical Professionals</Heading>
                                <HStack>
                                    <InputGroup w={{ base: "full", md: "250px" }}>
                                        <InputLeftElement pointerEvents="none"><FiSearch color="gray.300" /></InputLeftElement>
                                        <Input placeholder="Search staff..." value={staffSearchQuery} onChange={(e) => setStaffSearchQuery(e.target.value)} />
                                    </InputGroup>
                                    <Select w="150px" value={staffSortOrder} onChange={(e) => setStaffSortOrder(e.target.value)}>
                                        <option value="name-asc">Name (A-Z)</option>
                                        <option value="name-desc">Name (Z-A)</option>
                                        <option value="role">Role</option>
                                    </Select>
                                    {(user?.role || '').toLowerCase().includes('super') && (
                                        <Button size="sm" colorScheme="teal" leftIcon={<FiUsers />} onClick={onAddStaffOpen}>Add New Staff</Button>
                                    )}
                                </HStack>
                            </Flex>

                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Name</Th>
                                            <Th>Role</Th>
                                            <Th>Specialization</Th>
                                            <Th>Schedule</Th>
                                            <Th>Status</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredStaff.length > 0 ? (
                                            filteredStaff.map((staff) => (
                                                <Tr key={staff.id}>
                                                    <Td>
                                                        <HStack>
                                                            <Avatar size="sm" name={`${staff.first_name} ${staff.last_name}`} />
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontWeight="600">{staff.first_name} {staff.last_name}</Text>
                                                            </VStack>
                                                        </HStack>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={
                                                            staff.role === 'Doctor' ? 'blue' :
                                                                staff.role === 'Nurse' ? 'green' : 'orange'
                                                        }>
                                                            {staff.role}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm">{staff.specialization || 'General'}</Text>
                                                            {staff.prc_license_number && <Text fontSize="xs" color="gray.500">PRC: {staff.prc_license_number}</Text>}
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm">{staff.schedule || 'N/A'}</Text>
                                                            {staff.clinic_room && <Text fontSize="xs" color="gray.500">Rm: {staff.clinic_room}</Text>}
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <Badge variant="subtle" colorScheme="green">Active</Badge>
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={1}>
                                                            {(user?.role || '').toLowerCase().includes('super') ? (
                                                                <>
                                                                    <Button size="xs" variant="ghost" onClick={() => handleEditClick(staff)}>Edit</Button>
                                                                    <Button size="xs" variant="ghost" colorScheme="orange" onClick={() => handleResendCredentials(staff.id)}>Resend</Button>
                                                                </>
                                                            ) : (
                                                                <Button size="xs" colorScheme="gray" variant="outline" onClick={() => handleEditClick(staff)}>View</Button>
                                                            )}
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={6} textAlign="center" py={4}>No medical staff found.</Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );
            }
            case 'analytics': {
                // ── computed helpers ──────────────────────────────────
                const pct = (a: number, b: number) =>
                    b === 0 ? 0 : Math.round(((a - b) / b) * 100);

                const prenatalCount = analyticsData?.prenatal?.count ?? 0;
                const prenatalPrev = analyticsData?.prenatal?.prev_month ?? 0;
                const prenatalTarget = analyticsData?.prenatal?.target ?? 1600;
                const prenatalBarPct = prenatalTarget > 0 ? Math.min(100, Math.round((prenatalCount / prenatalTarget) * 100)) : 0;
                const prenatalChange = pct(prenatalCount, prenatalPrev);

                const immunCount = analyticsData?.immunization?.count ?? 0;
                const immunPrev = analyticsData?.immunization?.prev_month ?? 0;
                const immunChange = pct(immunCount, immunPrev);
                // Show progress toward 95% coverage target (using %) — cap at 100
                const immunBarPct = Math.min(100, immunCount > 0 ? Math.round((immunCount / (prenatalCount || immunCount)) * 100) : 0);

                const tbPct = analyticsData?.tb_treatment?.success_pct ?? 0;
                const tbTotal = analyticsData?.tb_treatment?.total ?? 0;


                return (
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="FHSIS REPORTING"
                            title="Field Health Services Information System"
                            description="Real-time tracking of public health programs, immunization targets, and morbidity statistics complying with DOH standards."
                        />

                        {/* Export Toolbar */}
                        <Flex justify="flex-end" wrap="wrap" gap={3}>
                            <Text alignSelf="center" fontSize="sm" color="gray.500" fontWeight="medium">Export Records:</Text>
                            <Button
                                size="sm" colorScheme="red" variant="outline"
                                leftIcon={<Icon as={FiFileText} />}
                                onClick={() => {
                                    const headers = ['Service', 'Total Appointments', 'Upcoming', 'Completed'];
                                    const rows = (predictiveData?.top_services || []).map((s: any) => [
                                        s.service, s.total, s.upcoming, s.completed
                                    ]);
                                    downloadPDF(
                                        'service_demand_report.pdf',
                                        'Service Demand Report',
                                        headers, rows
                                    );
                                }}
                                isDisabled={!predictiveData}
                            >
                                PDF
                            </Button>
                            <Button
                                size="sm" colorScheme="green" variant="outline"
                                leftIcon={<Icon as={FiFileText} />}
                                onClick={() => {
                                    const headers = ['Service', 'Total Appointments', 'Upcoming', 'Completed'];
                                    const rows = (predictiveData?.top_services || []).map((s: any) => [
                                        s.service, s.total, s.upcoming, s.completed
                                    ]);
                                    downloadCSV('service_demand_report.csv', headers, rows);
                                }}
                                isDisabled={!predictiveData}
                            >
                                CSV
                            </Button>
                        </Flex>

                        {analyticsLoading && (
                            <Flex justify="center" py={4}>
                                <Spinner color="teal.500" size="lg" />
                            </Flex>
                        )}

                        {/* Summary Cards */}
                        {!analyticsLoading && (
                            <>
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                                    {/* Prenatal */}
                                    <Box
                                        bg="white" p={8} borderRadius="3xl" boxShadow="sm" borderLeft="4px solid" borderColor="teal.500"
                                        cursor="pointer" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                                        onClick={() => { setSelectedCard('prenatal'); onOpen(); }}
                                    >
                                        <Stat>
                                            <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">Prenatal Care Visits</StatLabel>
                                            <StatNumber fontSize="3xl" color="teal.700">{prenatalCount.toLocaleString()}</StatNumber>
                                            {prenatalPrev > 0 ? (
                                                <StatHelpText>
                                                    <StatArrow type={prenatalChange >= 0 ? 'increase' : 'decrease'} />
                                                    {Math.abs(prenatalChange)}% vs last month
                                                </StatHelpText>
                                            ) : (
                                                <StatHelpText color="gray.400">No prior month data</StatHelpText>
                                            )}
                                        </Stat>
                                        <Progress value={prenatalBarPct} size="xs" colorScheme="teal" mt={4} borderRadius="full" />
                                        <Text fontSize="xs" mt={2} color="gray.400">Target: {prenatalTarget.toLocaleString()} visits ({prenatalBarPct}%)</Text>
                                    </Box>

                                    {/* Immunization */}
                                    <Box
                                        bg="white" p={8} borderRadius="3xl" boxShadow="sm" borderLeft="4px solid" borderColor="orange.500"
                                        cursor="pointer" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                                        onClick={() => { setSelectedCard('immunization'); onOpen(); }}
                                    >
                                        <Stat>
                                            <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">Immunization Appointments</StatLabel>
                                            <StatNumber fontSize="3xl" color="orange.700">{immunCount.toLocaleString()}</StatNumber>
                                            {immunPrev > 0 ? (
                                                <StatHelpText>
                                                    <StatArrow type={immunChange >= 0 ? 'increase' : 'decrease'} />
                                                    {Math.abs(immunChange)}% vs last month
                                                </StatHelpText>
                                            ) : (
                                                <StatHelpText color="gray.400">No prior month data</StatHelpText>
                                            )}
                                        </Stat>
                                        <Progress value={immunBarPct} size="xs" colorScheme="orange" mt={4} borderRadius="full" />
                                        <Text fontSize="xs" mt={2} color="gray.400">Target: 95% Coverage</Text>
                                    </Box>

                                    {/* TB Treatment */}
                                    <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" borderLeft="4px solid" borderColor="blue.500">
                                        <Stat>
                                            <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">TB / DOTS Treatment Success</StatLabel>
                                            <StatNumber fontSize="3xl" color="blue.700">
                                                {tbTotal > 0 ? `${tbPct}%` : 'N/A'}
                                            </StatNumber>
                                            <StatHelpText color="gray.400">
                                                {tbTotal > 0
                                                    ? `${analyticsData.tb_treatment.completed} of ${tbTotal} completed`
                                                    : 'No TB/DOTS appointments recorded'}
                                            </StatHelpText>
                                        </Stat>
                                        <Progress value={tbTotal > 0 ? tbPct : 0} size="xs" colorScheme="blue" mt={4} borderRadius="full" />
                                        <Text fontSize="xs" mt={2} color="gray.400">DOH Target: &gt;90%</Text>
                                    </Box>
                                </SimpleGrid>

                            </>
                        )}

                        {/* ── Predictive Resource Allocation ─────────────────── */}
                        <Box>
                            <HStack mb={6} spacing={3} align="center">
                                <Box p={2} bg="purple.50" borderRadius="lg">
                                    <Icon as={FiBarChart2} color="purple.500" boxSize={5} />
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" fontSize="lg" color="gray.800">
                                        Predictive Resource Allocation
                                    </Text>
                                </Box>
                                <Badge ml="auto" colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">
                                    AI-Assisted
                                </Badge>
                                <Button size="xs" leftIcon={<Icon as={FiRefreshCw} />} variant="ghost" colorScheme="purple"
                                    onClick={fetchPredictiveInsights} isLoading={predictiveLoading}>
                                    Refresh
                                </Button>
                            </HStack>

                            {/* Legend */}
                            <Flex
                                wrap="wrap" gap={4} px={4} py={3}
                                bg="gray.50" borderRadius="xl" mb={2}
                                align="center"
                            >
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide" mr={2}>
                                    Legend:
                                </Text>
                                {/* Inventory badges */}
                                <HStack spacing={1}>
                                    <Box w={2} h={2} borderRadius="full" bg="red.500" />
                                    <Badge colorScheme="red" fontSize="2xs" variant="subtle">CRITICAL</Badge>
                                    <Text fontSize="2xs" color="gray.500">— Out of stock or flagged Critical</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={2} h={2} borderRadius="full" bg="orange.400" />
                                    <Badge colorScheme="orange" fontSize="2xs" variant="subtle">LOW</Badge>
                                    <Text fontSize="2xs" color="gray.500">— ≤10 units or Low Stock status</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Box w={2} h={2} borderRadius="full" bg="yellow.400" />
                                    <Badge colorScheme="yellow" fontSize="2xs" variant="subtle">WATCH</Badge>
                                    <Text fontSize="2xs" color="gray.500">— Related to high-demand services</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Badge colorScheme="orange" fontSize="2xs">⚠️ Warning</Badge>
                                    <Text fontSize="2xs" color="gray.500">— ≥3 appointments this week</Text>
                                </HStack>
                                <HStack spacing={1}>
                                    <Badge colorScheme="blue" fontSize="2xs">ℹ️ Info</Badge>
                                    <Text fontSize="2xs" color="gray.500">— General scheduling insight</Text>
                                </HStack>
                            </Flex>

                            {predictiveLoading && (
                                <Flex justify="center" py={8}>
                                    <Spinner color="purple.500" size="lg" />
                                </Flex>
                            )}

                            {!predictiveLoading && predictiveData && (
                                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>

                                    {/* Top Services */}
                                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" borderTop="4px solid" borderColor="purple.400">
                                        <Text fontWeight="bold" fontSize="sm" color="purple.700" mb={4} textTransform="uppercase" letterSpacing="wide">
                                            📊 Service Demand
                                        </Text>
                                        <VStack align="stretch" spacing={3}>
                                            {(predictiveData.top_services || []).slice(0, 5).map((svc: any, i: number) => (
                                                <Box key={i}>
                                                    <Flex justify="space-between" mb={1}>
                                                        <Text fontSize="sm" fontWeight="medium" color="gray.700" noOfLines={1}>
                                                            {svc.service}
                                                        </Text>
                                                        <HStack spacing={1}>
                                                            {svc.upcoming > 0 && (
                                                                <Badge colorScheme="orange" fontSize="xs">{svc.upcoming} upcoming</Badge>
                                                            )}
                                                            <Badge colorScheme="teal" variant="outline" fontSize="xs">{svc.total}</Badge>
                                                        </HStack>
                                                    </Flex>
                                                    <Progress
                                                        value={Math.min(100, (svc.total / Math.max(...(predictiveData.top_services || []).map((s: any) => s.total), 1)) * 100)}
                                                        size="xs" colorScheme="purple" borderRadius="full"
                                                    />
                                                </Box>
                                            ))}
                                            {(predictiveData.top_services || []).length === 0 && (
                                                <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                                                    No appointment data yet
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Recommended Inventory */}
                                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" borderTop="4px solid" borderColor="green.400">
                                        <Text fontWeight="bold" fontSize="sm" color="green.700" mb={4} textTransform="uppercase" letterSpacing="wide">
                                            💊 Inventory Forecast
                                        </Text>
                                        <VStack align="stretch" spacing={2}>
                                            {(predictiveData.recommended_inventory || []).slice(0, 8).map((inv: any, i: number) => {
                                                const isOut = inv.stock === 0;
                                                const isCritical = inv.status === 'Critical' || isOut;
                                                const isLow = inv.status === 'Low Stock' || inv.stock <= 10;
                                                const dotColor = isCritical ? "red.500" : isLow ? "orange.400" : "yellow.400";
                                                const badgeColor = isCritical ? "red" : isLow ? "orange" : "yellow";
                                                const badgeLabel = isCritical ? "CRITICAL" : isLow ? "LOW" : "WATCH";
                                                return (
                                                    <Box key={i} py={1} borderBottom="1px solid" borderColor="gray.100" _last={{ borderBottom: 'none' }}>
                                                        <Flex align="center" gap={2}>
                                                            <Box w={2} h={2} borderRadius="full" bg={dotColor} flexShrink={0} />
                                                            <Box flex={1} minW={0}>
                                                                <Text fontSize="xs" color="gray.800" fontWeight="medium" noOfLines={1}>{inv.item}</Text>
                                                                <Text fontSize="2xs" color="gray.400">{inv.category} · {inv.stock} {inv.unit} remaining</Text>
                                                            </Box>
                                                            <Badge colorScheme={badgeColor} fontSize="2xs" variant="subtle" flexShrink={0}>
                                                                {badgeLabel}
                                                            </Badge>
                                                        </Flex>
                                                    </Box>
                                                );
                                            })}
                                            {(predictiveData.recommended_inventory || []).length === 0 && (
                                                <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                                                    All inventory levels look sufficient
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Staffing Alerts */}
                                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" borderTop="4px solid" borderColor="blue.400">
                                        <Text fontWeight="bold" fontSize="sm" color="blue.700" mb={4} textTransform="uppercase" letterSpacing="wide">
                                            👥 Staffing Insights
                                        </Text>
                                        <VStack align="stretch" spacing={3}>
                                            {(predictiveData.staffing_alerts || []).map((alert: any, i: number) => (
                                                <Box
                                                    key={i} p={3} borderRadius="lg"
                                                    bg={alert.level === 'warning' ? "orange.50" : "blue.50"}
                                                    borderLeft="3px solid"
                                                    borderColor={alert.level === 'warning' ? "orange.400" : "blue.400"}
                                                >
                                                    <HStack spacing={2} align="flex-start">
                                                        <Text fontSize="sm">{alert.level === 'warning' ? '⚠️' : 'ℹ️'}</Text>
                                                        <Text fontSize="xs" color="gray.700" lineHeight="tall">{alert.message}</Text>
                                                    </HStack>
                                                </Box>
                                            ))}
                                            {(predictiveData.staffing_alerts || []).length === 0 && (
                                                <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                                                    No staffing alerts at this time
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>
                                </SimpleGrid>
                            )}

                            {!predictiveLoading && !predictiveData && (
                                <Box p={8} textAlign="center" bg="white" borderRadius="2xl" boxShadow="sm">
                                    <Text color="gray.400">Could not load predictive data. Please try refreshing.</Text>
                                </Box>
                            )}
                        </Box>

                    </VStack>
                );
            }
            case 'tickets': {
                const filteredTickets = contactTickets.filter(ticket =>
                    ticketFilter === 'open' ? ticket.status !== 'Resolved' : ticket.status === 'Resolved'
                );

                return (
                    <VStack align="stretch" spacing={10}>
                        <PageHero
                            badge="SUPPORT TICKETS"
                            title="Patient & Public Inquiries"
                            description="Review and resolve contact form submissions from the public website."
                        />
                        <Box bg="white" p={8} borderRadius="3xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6}>
                                <HStack spacing={6}>
                                    <Heading size="md" color="teal.800">Recent Tickets</Heading>
                                    <HStack bg="gray.100" p={1} borderRadius="lg">
                                        <Button
                                            size="sm"
                                            variant={ticketFilter === 'open' ? 'solid' : 'ghost'}
                                            colorScheme={ticketFilter === 'open' ? 'teal' : 'gray'}
                                            onClick={() => setTicketFilter('open')}
                                            borderRadius="md"
                                        >
                                            Open Inquiries
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={ticketFilter === 'resolved' ? 'solid' : 'ghost'}
                                            colorScheme={ticketFilter === 'resolved' ? 'teal' : 'gray'}
                                            onClick={() => setTicketFilter('resolved')}
                                            borderRadius="md"
                                        >
                                            Resolved
                                        </Button>
                                    </HStack>
                                </HStack>
                                <Button size="sm" colorScheme="teal" variant="outline" leftIcon={<Icon as={FiRefreshCw} />} onClick={fetchContactTickets}>
                                    Refresh
                                </Button>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Ticket No.</Th>
                                            <Th>Date</Th>
                                            <Th>Name</Th>
                                            <Th>Email</Th>
                                            <Th>Subject & Message</Th>
                                            <Th>Status</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredTickets.length > 0 ? (
                                            filteredTickets.map(ticket => (
                                                <Tr key={ticket.id}>
                                                    <Td>
                                                        <Badge colorScheme="purple" variant="subtle" fontSize="sm">
                                                            {`TCKT-${new Date(ticket.created_at).getFullYear()}-${ticket.id.toString().padStart(3, '0')}`}
                                                        </Badge>
                                                    </Td>
                                                    <Td>{new Date(ticket.created_at).toLocaleDateString()}</Td>
                                                    <Td fontWeight="600">{ticket.name}</Td>
                                                    <Td>{ticket.email}<br /><Text fontSize="xs" color="gray.500">{ticket.phone}</Text></Td>
                                                    <Td maxW="300px">
                                                        <Text fontWeight="bold" noOfLines={1} mb={1}>{ticket.subject}</Text>
                                                        <Text fontSize="sm" color="gray.600" noOfLines={2}>{ticket.message}</Text>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={ticket.status === 'Resolved' ? 'green' : 'orange'}>
                                                            {ticket.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        {ticket.status !== 'Resolved' && (
                                                            <Button size="xs" colorScheme="teal" onClick={() => handleResolveTicket(ticket.id)}>
                                                                Mark Resolved
                                                            </Button>
                                                        )}
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={7} textAlign="center" py={6} color="gray.500">
                                                    No {ticketFilter} tickets found.
                                                </Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );
            }

            default:
                return null;
        }
    };

    return (
        <Box minH="100vh" bg="#f8f9fc">
            {/* Admin Sidebar */}
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
                            BHCare <Text as="span" color="orange.500" fontSize="xs">ADMIN</Text>
                        </Text>
                    </HStack>
                </Flex>

                <VStack spacing={2} align="stretch" px={4}>
                    <NavItem icon={FiGrid} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                        Dashboard Overview
                    </NavItem>
                    <NavItem icon={FiUsers} active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
                        User Management
                    </NavItem>
                    <NavItem icon={FiActivity} active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')}>
                        Medical Staff
                    </NavItem>
                    <NavItem icon={FiMessageSquare} active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')}>
                        Support Tickets
                    </NavItem>
                    <NavItem icon={FiBarChart2} active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
                        Analytics & Reports
                    </NavItem>
                </VStack>

                <Box pos="absolute" bottom="8" w="full" px={4}>
                    <Divider mb={4} />
                    <NavItem icon={FiLogOut} onClick={onLogout}>
                        Logout
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
                                Administration Control Panel
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack spacing={4}>
                        <VStack align="end" spacing={0} mr={2}>
                            <Text fontWeight="800" color="teal.800" fontSize="sm">
                                {user?.first_name} {user?.last_name}
                            </Text>
                            <Text color="orange.500" fontSize="xs" fontWeight="700">
                                System Administrator
                            </Text>
                        </VStack>
                        <Avatar size="md" name={`${user?.first_name} ${user?.last_name}`} bg="orange.500" color="white" border="2px solid white" boxShadow="lg" />
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
                                        BHCare <Text as="span" color="orange.500" fontSize="xs">ADMIN</Text>
                                    </Text>
                                </HStack>
                            </Flex>
                            <VStack spacing={2} align="stretch" px={4}>
                                <NavItem icon={FiGrid} active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); onSidebarClose(); }}>
                                    Overview
                                </NavItem>
                                <NavItem icon={FiUsers} active={activeTab === 'users'} onClick={() => { setActiveTab('users'); onSidebarClose(); }}>
                                    User Management
                                </NavItem>
                                <NavItem icon={FiActivity} active={activeTab === 'doctors'} onClick={() => { setActiveTab('doctors'); onSidebarClose(); }}>
                                    Medical Staff
                                </NavItem>
                                <NavItem icon={FiMessageSquare} active={activeTab === 'tickets'} onClick={() => { setActiveTab('tickets'); onSidebarClose(); }}>
                                    Support Tickets
                                </NavItem>
                                <NavItem icon={FiBarChart2} active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); onSidebarClose(); }}>
                                    Analytics & Reports
                                </NavItem>
                            </VStack>
                            <Box pos="absolute" bottom="8" w="full" px={4}>
                                <Divider mb={4} />
                                <NavItem icon={FiLogOut} onClick={onLogout}>
                                    Logout
                                </NavItem>
                            </Box>
                        </Box>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* Edit User Modal */}
            <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered size="lg">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                        <HStack align="center" spacing={3}>
                            <Icon as={FiUser} boxSize={6} />
                            <Text>{(user?.role || '').toLowerCase().includes('super') ? 'Edit User Information' : 'User Information'}</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton mt={2} />
                    <ModalBody py={6}>
                        <VStack spacing={5}>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">First Name</Text>
                                <input
                                    className="chakra-input css-1"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem', backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
                                    value={formData.first_name}
                                    readOnly
                                />
                            </Box>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Last Name</Text>
                                <input
                                    className="chakra-input css-1"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem', backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
                                    value={formData.last_name}
                                    readOnly
                                />
                            </Box>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Email</Text>
                                <input
                                    className="chakra-input css-1"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem', backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
                                    value={formData.email}
                                    readOnly
                                />
                            </Box>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Contact Number</Text>
                                <input
                                    className="chakra-input css-1"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}
                                    value={formData.contact_number}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                        setFormData({ ...formData, contact_number: val });
                                    }}
                                    placeholder="09XXXXXXXXX"
                                    maxLength={11}
                                />
                            </Box>
                            <HStack w="full" spacing={4}>
                                <Box w="full">
                                    <Text mb={1} fontSize="sm" fontWeight="bold">Date of Birth</Text>
                                    <input
                                        type="date"
                                        className="chakra-input css-1"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem', backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
                                        value={formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : ''}
                                        readOnly
                                    />
                                </Box>
                                <Box w="full">
                                    <Text mb={1} fontSize="sm" fontWeight="bold">Gender</Text>
                                    <input
                                        className="chakra-input css-1"
                                        style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem', backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
                                        value={formData.gender || ''}
                                        readOnly
                                    />
                                </Box>
                            </HStack>
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Complete Address (Include Barangay & City)</Text>
                                <textarea
                                    className="chakra-textarea css-1"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem', backgroundColor: '#f7fafc', cursor: 'not-allowed', resize: 'vertical', minHeight: '120px' }}
                                    value={formData.full_address || [formData.barangay, formData.city].filter(Boolean).join(', ') || 'Address not provided'}
                                    readOnly
                                />
                            </Box>

                            {['Medical Staff', 'Doctor', 'Nurse', 'Midwife', 'Health Worker'].includes(formData.role) && (
                                <>
                                    <Divider />
                                    <Text fontWeight="bold" fontSize="sm">Medical Staff Details</Text>
                                    <HStack w="full">
                                        <Box w="full">
                                            <Text mb={1} fontSize="sm" fontWeight="bold">Specialization</Text>
                                            <input
                                                className="chakra-input css-1"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}
                                                value={formData.specialization}
                                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                placeholder="e.g. Pediatrics"
                                            />
                                        </Box>
                                        <Box w="full">
                                            <Text mb={1} fontSize="sm" fontWeight="bold">PRC License</Text>
                                            <input
                                                className="chakra-input css-1"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}
                                                value={formData.prc_license_number}
                                                onChange={(e) => setFormData({ ...formData, prc_license_number: e.target.value })}
                                                placeholder="e.g. 12345"
                                            />
                                        </Box>
                                    </HStack>
                                    <HStack w="full">
                                        <Box w="full">
                                            <Text mb={1} fontSize="sm" fontWeight="bold">Schedule</Text>
                                            <input
                                                className="chakra-input css-1"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}
                                                value={formData.schedule}
                                                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                                placeholder="e.g. Mon-Fri 8-5"
                                            />
                                        </Box>
                                        <Box w="full">
                                            <Text mb={1} fontSize="sm" fontWeight="bold">Room</Text>
                                            <input
                                                className="chakra-input css-1"
                                                style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '0.375rem' }}
                                                value={formData.clinic_room}
                                                onChange={(e) => setFormData({ ...formData, clinic_room: e.target.value })}
                                                placeholder="e.g. Room 101"
                                            />
                                        </Box>
                                    </HStack>
                                    <Box w="full">
                                        <Text mb={1} fontSize="sm" fontWeight="bold">Status</Text>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="On Leave">On Leave</option>
                                        </Select>
                                    </Box>
                                </>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTopWidth="1px">
                        <Button variant="ghost" mr={3} onClick={onEditClose}>
                            {(user?.role || '').toLowerCase().includes('super') ? 'Cancel' : 'Close'}
                        </Button>
                        {(user?.role || '').toLowerCase().includes('super') && (
                            <Button colorScheme="blue" onClick={handleUpdateUser} _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}>Save Changes</Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Add Staff Modal */}
            <Modal isOpen={isAddStaffOpen} onClose={onAddStaffClose} isCentered size="lg">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                        <HStack align="center" spacing={3}>
                            <Icon as={FiUserPlus} boxSize={6} />
                            <Text>Add New Medical Staff</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton mt={2} />
                    <ModalBody py={6}>
                        <VStack spacing={5}>
                            <FormControl>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                >
                                    <option value="Doctor">Doctor</option>
                                    <option value="Nurse">Nurse</option>
                                    <option value="Midwife">Midwife</option>
                                    <option value="Health Worker">Health Worker</option>
                                </Select>
                            </FormControl>
                            <HStack w="full">
                                <FormControl>
                                    <FormLabel>First Name</FormLabel>
                                    <Input
                                        value={newStaff.first_name}
                                        onChange={(e) => setNewStaff({ ...newStaff, first_name: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Last Name</FormLabel>
                                    <Input
                                        value={newStaff.last_name}
                                        onChange={(e) => setNewStaff({ ...newStaff, last_name: e.target.value })}
                                    />
                                </FormControl>
                            </HStack>
                            <FormControl>
                                <FormLabel>Email Address</FormLabel>
                                <Input
                                    type="email"
                                    value={newStaff.email}
                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Contact Number</FormLabel>
                                <Input
                                    value={newStaff.contact_number}
                                    onChange={(e) => setNewStaff({ ...newStaff, contact_number: e.target.value })}
                                />
                            </FormControl>

                            <Divider />
                            <Text fontWeight="bold" fontSize="sm">Professional Details</Text>

                            <HStack w="full">
                                <FormControl>
                                    <FormLabel>PRC License #</FormLabel>
                                    <Input
                                        value={newStaff.prc_license_number}
                                        onChange={(e) => setNewStaff({ ...newStaff, prc_license_number: e.target.value })}
                                        placeholder="e.g. 1234567"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Specialization</FormLabel>
                                    <Input
                                        value={newStaff.specialization}
                                        onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                                        placeholder="e.g. Pediatrics"
                                    />
                                </FormControl>
                            </HStack>
                            <HStack w="full">
                                <FormControl>
                                    <FormLabel>Schedule</FormLabel>
                                    <Input
                                        value={newStaff.schedule}
                                        onChange={(e) => setNewStaff({ ...newStaff, schedule: e.target.value })}
                                        placeholder="e.g. Mon-Fri 8am-5pm"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Clinic Room</FormLabel>
                                    <Input
                                        value={newStaff.clinic_room}
                                        onChange={(e) => setNewStaff({ ...newStaff, clinic_room: e.target.value })}
                                        placeholder="e.g. Room 101"
                                    />
                                </FormControl>
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderTopWidth="1px">
                        <Button variant="ghost" mr={3} onClick={onAddStaffClose}>Cancel</Button>
                        <Button colorScheme="teal" onClick={handleAddStaff} _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}>Create Account</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>
    );
};

export default AdminDashboard;
