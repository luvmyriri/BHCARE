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
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import {
    FiGrid,
    FiUsers,
    FiCalendar,
    FiLogOut,
    FiActivity,
    FiSettings,
    FiBarChart2,
    FiShield,
    FiMap,
    FiAlertTriangle,
    FiMenu
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

interface AdminDashboardProps {
    user: any;
    onLogout: () => void;
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

const AdminStatCard = ({ label, value, icon, color, onClick }: any) => (
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

    // User Management State
    const [editUser, setEditUser] = useState<any>(null);
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        role: 'Patient',
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

    // Trigger analytics fetch when tab opens
    useEffect(() => {
        if (activeTab === 'analytics' && !analyticsData) {
            fetchAnalytics();
        }
    }, [activeTab]);

    // Initial Data Fetch
    React.useEffect(() => {
        fetchUsers();
        fetchMedicalStaff();
        fetchAppointments();
        fetchSystemStats();
        fetch('/api/admin/activities')
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setRecentActivities(data); })
            .catch(() => setRecentActivities([
                { user: 'System', action: 'Backup Completed', time: 'Today, 03:00 AM', type: 'COMPLETED' },
                { user: 'Dr. Santos', action: 'Logged In', time: 'Today, 07:45 AM', type: 'NEW' },
                { user: 'Nurse Joyce', action: 'Updated Inventory', time: 'Yesterday, 05:30 PM', type: 'UPDATE' }
            ]));
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

    const handleToggleUserStatus = async (user: any) => {
        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        const actionWord = newStatus === 'Active' ? 'activate' : 'deactivate';
        if (!confirm(`Are you sure you want to ${actionWord} this user?`)) return;

        try {
            // We use the same update endpoint
            const response = await fetch(`/user/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchUsers(); // Refresh list
                toast({
                    title: "Status Updated",
                    description: `User is now ${newStatus}.`,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                toast({
                    title: "Failed",
                    description: `Failed to ${actionWord} user`,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error toggling user status:', error);
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
                        <ModalHeader>Total Users Breakdown</ModalHeader>
                        <ModalBody>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Category</Th><Th isNumeric>Count</Th></Tr></Thead>
                                    <Tbody>
                                        <Tr><Td>Residents (Barangay 174)</Td><Td isNumeric>{residentsCount}</Td></Tr>
                                        <Tr><Td>Non-Residents</Td><Td isNumeric>{nonResidentsCount}</Td></Tr>
                                        <Tr><Td fontWeight="bold">Total</Td><Td isNumeric fontWeight="bold">{users.length}</Td></Tr>
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                    </>
                );
            case 'doctors':
                return (
                    <>
                        <ModalHeader>Active Medical Staff</ModalHeader>
                        <ModalBody>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Name</Th><Th>Role</Th><Th>Status</Th></Tr></Thead>
                                    <Tbody>
                                        {medicalStaff.length > 0 ? (
                                            medicalStaff.map((staff: any) => (
                                                <Tr key={staff.id}>
                                                    <Td>{staff.first_name} {staff.last_name}</Td>
                                                    <Td>{staff.specialization || staff.role}</Td>
                                                    <Td><Badge colorScheme="green">Active</Badge></Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr><Td colSpan={3}>No medical staff found.</Td></Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                    </>
                );
            case 'appointments':
                return (
                    <>
                        <ModalHeader>Today's Appointments</ModalHeader>
                        <ModalBody>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Time</Th><Th>Patient</Th><Th>Type</Th></Tr></Thead>
                                    <Tbody>
                                        {appointments.length > 0 ? (
                                            appointments.map((apt: any) => (
                                                <Tr key={apt.id}>
                                                    <Td>{apt.appointment_time || 'N/A'}</Td>
                                                    <Td>{apt.first_name ? `${apt.first_name} ${apt.last_name}` : 'Walk-in'}</Td>
                                                    <Td>{apt.service_type}</Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr><Td colSpan={3}>No appointments for today.</Td></Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                            <Box mt={4}>
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                                    Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                                </Text>
                            </Box>
                        </ModalBody>
                    </>
                );
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
            // FHSIS Modal Content
            case 'activity':
                return (
                    <ModalBody>
                        {selectedActivity ? (
                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontWeight="bold" color="gray.500" fontSize="sm">User</Text>
                                    <Text fontSize="lg">{selectedActivity.user}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" color="gray.500" fontSize="sm">Action</Text>
                                    <Text>{selectedActivity.action}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" color="gray.500" fontSize="sm">Type</Text>
                                    <Badge colorScheme={
                                        selectedActivity.type === 'UPDATE' ? 'blue' :
                                            selectedActivity.type === 'NEW' ? 'green' :
                                                selectedActivity.type === 'COMPLETE' ? 'orange' :
                                                    selectedActivity.type === 'COMPLETED' ? 'orange' : 'gray'
                                    }>{selectedActivity.type}</Badge>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold" color="gray.500" fontSize="sm">Timestamp</Text>
                                    <Text>{selectedActivity.time}</Text>
                                </Box>
                                <Divider />
                                <Box>
                                    <Text fontWeight="bold" color="gray.500" fontSize="sm">Additional Details</Text>
                                    <Text mt={1} p={3} bg="gray.50" borderRadius="md">{selectedActivity.details || 'No further details available.'}</Text>
                                </Box>
                            </VStack>
                        ) : (
                            <Text>No activity selected.</Text>
                        )}
                    </ModalBody>
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
                    <VStack align="stretch" spacing={8}>
                        <PageHero
                            badge="ADMIN CONTROL"
                            title={`Welcome, ${user?.first_name || 'Administrator'} 🛡️`}
                            description="Complete system oversight and management. Monitor all health center operations, user activities, and system performance in real-time."
                        />

                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
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

                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md" color="teal.800">Recent System Activities</Heading>
                                <Button size="sm" colorScheme="orange" variant="outline" leftIcon={<FiBarChart2 />}>View All Logs</Button>
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
                                                    <Button size="xs" variant="link" colorScheme="teal" onClick={() => { handleCardClick('activity'); handleViewActivity(activity); }}>View</Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                );
            case 'users':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge="USER MANAGEMENT"
                            title="System Users & Permissions"
                            description="Manage all user accounts, roles, and access permissions for doctors, staff, and patients."
                        />
                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md" color="teal.800">Registered Users</Heading>
                                <Button size="sm" colorScheme="orange" leftIcon={<FiActivity />} onClick={fetchUsers}>Refresh List</Button>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>ID</Th>
                                            <Th>Name</Th>
                                            <Th>Email</Th>
                                            <Th>Role</Th>
                                            <Th>Joined</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {users.length > 0 ? (
                                            users.map((user) => (
                                                <Tr key={user.id}>
                                                    <Td>#{user.id}</Td>
                                                    <Td fontWeight="600">{user.first_name} {user.last_name}</Td>
                                                    <Td>{user.email}</Td>
                                                    <Td>
                                                        <Badge colorScheme={user.role === 'Administrator' ? 'red' : user.role === 'Medical Staff' ? 'blue' : 'green'}>
                                                            {user.role}
                                                        </Badge>
                                                    </Td>
                                                    <Td>{user.created_at || 'N/A'}</Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            <Button size="xs" colorScheme="blue" variant="ghost" onClick={() => handleEditClick(user)}>Edit</Button>
                                                            <Button
                                                                size="xs"
                                                                colorScheme={user.status === 'Active' ? 'red' : 'green'}
                                                                variant="ghost"
                                                                onClick={() => handleToggleUserStatus(user)}
                                                            >
                                                                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                            </Button>
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
            case 'doctors':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge="MEDICAL STAFF"
                            title="Doctor & Staff Registry"
                            description="View and manage all medical professionals, their schedules, and performance metrics."
                        />

                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md" color="teal.800">Medical Professionals</Heading>
                                <Button size="sm" colorScheme="teal" leftIcon={<FiUsers />} onClick={onAddStaffOpen}>Add New Staff</Button>
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
                                        {medicalStaff.length > 0 ? (
                                            medicalStaff.map((staff) => (
                                                <Tr key={staff.id}>
                                                    <Td>
                                                        <HStack>
                                                            <Avatar size="sm" name={`${staff.first_name} ${staff.last_name}`} />
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontWeight="600">{staff.first_name} {staff.last_name}</Text>
                                                                <Text fontSize="xs" color="gray.500">ID: {staff.id}</Text>
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
                                                        <Button size="xs" variant="ghost" onClick={() => handleEditClick(staff)}>Edit</Button>
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

                const morbidity: any[] = analyticsData?.morbidity ?? [];
                const hotspots: any[] = analyticsData?.dengue_hotspots ?? [];
                const dengueTotal: number = analyticsData?.dengue_total ?? 0;

                return (
                    <VStack align="stretch" spacing={8}>
                        <PageHero
                            badge="FHSIS REPORTING"
                            title="Field Health Services Information System"
                            description="Real-time tracking of public health programs, immunization targets, and morbidity statistics complying with DOH standards."
                        />

                        {analyticsLoading && (
                            <Flex justify="center" py={4}>
                                <Spinner color="teal.500" size="lg" />
                            </Flex>
                        )}

                        {/* Summary Cards */}
                        {!analyticsLoading && (
                            <>
                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                                    {/* Prenatal */}
                                    <Box
                                        bg="white" p={6} borderRadius="2xl" boxShadow="sm" borderLeft="4px solid" borderColor="teal.500"
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
                                        bg="white" p={6} borderRadius="2xl" boxShadow="sm" borderLeft="4px solid" borderColor="orange.500"
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
                                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" borderLeft="4px solid" borderColor="blue.500">
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

                                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                                    {/* Morbidity Report */}
                                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm">
                                        <Flex justify="space-between" align="center" mb={4}>
                                            <HStack>
                                                <Icon as={FiAlertTriangle} color="red.500" />
                                                <Heading size="md" color="gray.700">Top Morbidity (Diagnoses)</Heading>
                                            </HStack>
                                            <HStack>
                                                <Badge colorScheme="red">Live Data</Badge>
                                                <Button size="xs" variant="ghost" colorScheme="teal" onClick={fetchAnalytics}>Refresh</Button>
                                            </HStack>
                                        </Flex>
                                        <Box overflowX="auto">
                                            <Table variant="simple" size="sm">
                                                <Thead>
                                                    <Tr>
                                                        <Th>Rank</Th>
                                                        <Th>Illness / Diagnosis</Th>
                                                        <Th isNumeric>Cases</Th>
                                                        <Th>Trend</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {morbidity.length > 0 ? (
                                                        morbidity.map((d: any, i: number) => (
                                                            <Tr key={i}>
                                                                <Td fontWeight="bold" color="gray.500">#{i + 1}</Td>
                                                                <Td fontWeight="600">{d.name}</Td>
                                                                <Td isNumeric fontWeight="bold">{d.cases.toLocaleString()}</Td>
                                                                <Td>
                                                                    <Badge colorScheme={
                                                                        d.trend === 'up' ? 'red' :
                                                                            d.trend === 'down' ? 'green' : 'gray'
                                                                    }>
                                                                        {d.trend === 'up' ? 'Rising' : d.trend === 'down' ? 'Falling' : 'Stable'}
                                                                    </Badge>
                                                                </Td>
                                                            </Tr>
                                                        ))
                                                    ) : (
                                                        <Tr>
                                                            <Td colSpan={4} textAlign="center" py={6} color="gray.400">
                                                                No diagnosis data recorded yet. Data will appear as doctors complete consultations.
                                                            </Td>
                                                        </Tr>
                                                    )}
                                                </Tbody>
                                            </Table>
                                        </Box>
                                    </Box>

                                    {/* Disease Heatmap */}
                                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm">
                                        <Flex justify="space-between" align="center" mb={4}>
                                            <HStack>
                                                <Icon as={FiMap} color="teal.500" />
                                                <Heading size="md" color="gray.700">Disease Heatmap (Dengue)</Heading>
                                            </HStack>
                                            <Badge colorScheme={dengueTotal > 0 ? 'red' : 'gray'}>
                                                {dengueTotal > 0 ? `${dengueTotal} cases` : 'No cases'}
                                            </Badge>
                                        </Flex>

                                        <Box
                                            h="220px"
                                            bg="gray.100"
                                            borderRadius="xl"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            bgImage="linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Caloocan_City_Barangays.png/1200px-Caloocan_City_Barangays.png')"
                                            bgSize="cover"
                                            bgPosition="center"
                                            position="relative"
                                            mb={4}
                                        >
                                            {/* Dynamic blobs for hotspots */}
                                            {hotspots.map((h: any, i: number) => (
                                                <Box
                                                    key={i}
                                                    position="absolute"
                                                    top={`${25 + i * 18}%`}
                                                    left={`${30 + i * 15}%`}
                                                    bg={h.level === 'High' ? 'red.500' : h.level === 'Medium' ? 'orange.400' : 'yellow.400'}
                                                    w={`${50 - i * 5}px`} h={`${50 - i * 5}px`}
                                                    borderRadius="full"
                                                    opacity={0.6 - i * 0.05}
                                                    filter="blur(8px)"
                                                />
                                            ))}
                                            {hotspots.length === 0 && (
                                                <Text color="gray.500" fontSize="sm">No active dengue hotspots</Text>
                                            )}
                                        </Box>

                                        {/* Hotspot List */}
                                        <VStack align="stretch" spacing={2}>
                                            <Text fontWeight="bold" fontSize="sm" mb={1}>Hotspot Summary</Text>
                                            {hotspots.length > 0 ? (
                                                hotspots.map((h: any, i: number) => (
                                                    <HStack key={i} spacing={2}>
                                                        <Box
                                                            w="3" h="3" borderRadius="full" flexShrink={0}
                                                            bg={h.level === 'High' ? 'red.500' : h.level === 'Medium' ? 'orange.400' : 'yellow.400'}
                                                        />
                                                        <Text fontSize="xs">{h.area} ({h.level}) — {h.count} case{h.count !== 1 ? 's' : ''}</Text>
                                                    </HStack>
                                                ))
                                            ) : (
                                                <Text fontSize="xs" color="gray.400">No dengue cases recorded. Hotspots will appear when dengue diagnoses are logged.</Text>
                                            )}
                                        </VStack>
                                    </Box>
                                </SimpleGrid>
                            </>
                        )}
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
            <Modal isOpen={isEditOpen} onClose={onEditClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit User</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
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
                            <Box w="full">
                                <Text mb={1} fontSize="sm" fontWeight="bold">Role (Access Level)</Text>
                                <Select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Patient">Patient</option>
                                    <option value="Medical Staff">Medical Staff</option>
                                    <option value="Administrator">Administrator</option>
                                    <option value="Doctor">Doctor</option>
                                    <option value="Nurse">Nurse</option>
                                    <option value="Midwife">Midwife</option>
                                    <option value="Health Worker">Health Worker</option>
                                </Select>
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
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onEditClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleUpdateUser}>Save Changes</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Add Staff Modal */}
            <Modal isOpen={isAddStaffOpen} onClose={onAddStaffClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New Medical Staff</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
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
                            <Divider />

                            <FormControl>
                                <FormLabel>Temporary Password</FormLabel>
                                <Input
                                    value={newStaff.password}
                                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>Default: bhcare.staff</Text>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAddStaffClose}>Cancel</Button>
                        <Button colorScheme="teal" onClick={handleAddStaff}>Create Account</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AdminDashboard;
