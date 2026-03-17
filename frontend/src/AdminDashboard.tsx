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
    FormLabel,
} from '@chakra-ui/react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
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
    FiFileText,
    FiMessageSquare
} from 'react-icons/fi';
import {
    SimpleGrid,
    Progress,
    Spinner,
} from '@chakra-ui/react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

interface AdminDashboardProps {
    user: any;
    onLogout: () => void;
}

// ── Export Utilities ────────────────────────────────────────────────────────

const BRAND_NAME = 'BHCare - Barangay 174 Health Center';

// CSV export removed; using branded Excel export for the "CSV" button.

/** Load logo as base64 for PDF */
const loadLogoBase64 = async (): Promise<string | null> => {
    try {
        const res = await fetch('/images/Logo.png');
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

/** Generic PDF download with BHCare branding and logo */
const downloadPDF = async (filename: string, title: string, headers: string[], rows: (string | number)[][]) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    let startY = 16;

    const logoBase64 = await loadLogoBase64();
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 8, 18, 18);
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(title, 36, 18);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`${BRAND_NAME}  ·  Generated: ${new Date().toLocaleString()}`, 36, 24);
        startY = 32;
    } else {
        doc.setFontSize(16);
        doc.text(title, 14, 16);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`${BRAND_NAME}  ·  Generated: ${new Date().toLocaleString()}`, 14, 23);
        startY = 28;
    }

    autoTable(doc, {
        head: [headers],
        body: rows.map(r => r.map(c => String(c ?? ''))),
        startY,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [0, 128, 128], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 250, 250] },
    });
    doc.save(filename);
};

/** Generic Excel download with BHCare branding and logo */
const downloadExcel = async (filename: string, title: string, headers: string[], rows: (string | number)[][]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Report', { views: [{ showGridLines: true }] });

    let logoBase64: string | null = null;
    try {
        const res = await fetch('/images/Logo.png');
        const blob = await res.blob();
        logoBase64 = await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(blob);
        });
    } catch { /* skip logo */ }

    let row = 1;
    if (logoBase64) {
        try {
            const base64Data = logoBase64.replace(/^data:image\/\w+;base64,/, '');
            const imageId = wb.addImage({ base64: base64Data, extension: 'png' });
            ws.addImage(imageId, { tl: { col: 0.2, row: 0.2 }, ext: { width: 48, height: 48 } } as any);
        } catch { /* skip logo on error */ }
        ws.getCell('C1').value = title;
        ws.getCell('C1').font = { bold: true, size: 14 };
        ws.getCell('C2').value = `${BRAND_NAME}`;
        ws.getCell('C2').font = { size: 10 };
        ws.getCell('C2').fill = { type: 'pattern', pattern: 'none' };
        ws.getCell('C3').value = `Generated: ${new Date().toLocaleString()}`;
        ws.getCell('C3').font = { size: 9 };
        ws.getCell('C3').fill = { type: 'pattern', pattern: 'none' };
        row = 6;
    } else {
        ws.getCell('A1').value = title;
        ws.getCell('A1').font = { bold: true, size: 14 };
        ws.getCell('A2').value = `${BRAND_NAME}  ·  Generated: ${new Date().toLocaleString()}`;
        ws.getCell('A2').font = { size: 10 };
        row = 4;
    }

    const headerRow = ws.getRow(row);
    headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF008080' } };
        cell.alignment = { vertical: 'middle' };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });
    headerRow.height = 22;
    row++;

    rows.forEach((r, idx) => {
        const dataRow = ws.getRow(row);
        r.forEach((val, j) => {
            const cell = dataRow.getCell(j + 1);
            cell.value = val;
            cell.fill = idx % 2 === 0 ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5FAFA' } } : { type: 'pattern', pattern: 'none' };
            cell.border = { bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });
        row++;
    });

    headers.forEach((h, i) => { ws.getColumn(i + 1).width = Math.max(h.length + 2, 12); });

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\.(csv|pdf)$/, '.xlsx');
    a.click();
    URL.revokeObjectURL(url);
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

    const confirmResolveTicket = (id: number) => {
        const toastId = `resolve-ticket-${id}`;
        if (toast.isActive(toastId)) return;

        toast({
            id: toastId,
            position: 'top',
            duration: 8000,
            isClosable: true,
            status: 'warning',
            render: ({ onClose }) => (
                <Box
                    bg="white"
                    border="1px solid"
                    borderColor="orange.200"
                    boxShadow="lg"
                    borderRadius="xl"
                    p={4}
                    maxW="420px"
                >
                    <Text fontWeight="800" color="orange.700" mb={1}>
                        Confirm resolve
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                        Mark this ticket as resolved? This will move it to the Resolved list.
                    </Text>
                    <HStack justify="flex-end">
                        <Button size="sm" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            colorScheme="teal"
                            onClick={async () => {
                                onClose();
                                await handleResolveTicket(id);
                            }}
                        >
                            Yes, resolve
                        </Button>
                    </HStack>
                </Box>
            ),
        });
    };

    const CHART_COLORS = ['#38b2ac', '#ed8936', '#3182ce', '#805ad5', '#48bb78', '#e53e3e'];

    // Refresh all live data
    const refreshAll = async () => {
        await Promise.all([
            fetchUsers(),
            fetchMedicalStaff(),
            fetchAppointments(),
            fetchSystemStats(),
            fetchActivities(),
            fetchContactTickets()
        ]);
        setLastUpdated(new Date());
    };

    // Initial load + 30-second polling interval
    React.useEffect(() => {
        refreshAll();
        const interval = setInterval(() => refreshAll(), 30000);
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
            case 'all-logs':
                return (
                    <>
                        <ModalHeader bg="teal.50" color="teal.800" borderBottomWidth="1px" pb={4}>
                            <HStack align="center" spacing={3}>
                                <Icon as={FiBarChart2} boxSize={6} />
                                <Text>All System Activity Logs</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalBody py={6}>
                            <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.200" boxShadow="sm">
                                <Table variant="simple" size="sm">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th py={4} color="gray.600">User/System</Th>
                                            <Th py={4} color="gray.600">Action</Th>
                                            <Th py={4} color="gray.600">Time</Th>
                                            <Th py={4} color="gray.600">Type</Th>
                                            <Th py={4} color="gray.600">Details</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {recentActivities.length > 0 ? (
                                            recentActivities.map((activity, index) => (
                                                <Tr key={index} _hover={{ bg: 'gray.50', transition: '0.2s' }}>
                                                    <Td fontWeight="bold" color="teal.700">{activity.user}</Td>
                                                    <Td>{activity.action}</Td>
                                                    <Td color="gray.500" fontSize="sm">{activity.time}</Td>
                                                    <Td>
                                                        <Badge
                                                            colorScheme={
                                                                activity.type === 'UPDATE' ? 'blue' :
                                                                    activity.type === 'NEW' ? 'green' :
                                                                        activity.type === 'COMPLETE' || activity.type === 'COMPLETED' ? 'orange' : 'gray'
                                                            }
                                                            borderRadius="full" px={3}
                                                        >
                                                            {activity.type}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <Button size="xs" colorScheme="gray" variant="outline"
                                                            onClick={() => { setSelectedCard('activity'); handleViewActivity(activity); }}
                                                        >View</Button>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={5} py={10}>
                                                    <VStack color="gray.400" spacing={3}>
                                                        <Icon as={FiBarChart2} boxSize={12} color="gray.300" />
                                                        <Text fontSize="md" fontWeight="500">No activity logs found.</Text>
                                                    </VStack>
                                                </Td>
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
                                <Heading size="md" color="teal.800">Recent System Activities</Heading>
                                <HStack spacing={3}>
                                    {lastUpdated && (
                                        <Text fontSize="xs" color="gray.400">
                                            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </Text>
                                    )}
                                    <Button size="sm" colorScheme="orange" variant="outline" leftIcon={<FiBarChart2 />} onClick={() => handleCardClick('all-logs')}>View All Logs</Button>
                                </HStack>
                            </Flex>
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>User/System</Th>
                                            <Th>Time</Th>
                                            <Th>Type</Th>
                                            <Th>Details</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {recentActivities.map((activity, index) => (
                                            <Tr key={index}>
                                                <Td fontWeight="bold">{activity.user}</Td>
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
                                    <Button
                                        size="sm" colorScheme="red" variant="outline"
                                        leftIcon={<Icon as={FiFileText} />}
                                        onClick={async () => {
                                            const headers = ['First Name', 'Last Name', 'Email', 'Date Joined'];
                                            const rows = filteredUsers.map((u: any) => [
                                                u.first_name, u.last_name, u.email,
                                                u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
                                            ]);
                                            await downloadPDF('users_report.pdf', 'Registered Users Report', headers, rows);
                                        }}
                                    >
                                        PDF
                                    </Button>
                                    <Button
                                        size="sm" colorScheme="green" variant="outline"
                                        leftIcon={<Icon as={FiFileText} />}
                                        onClick={async () => {
                                            const headers = ['First Name', 'Last Name', 'Email', 'Date Joined'];
                                            const rows = filteredUsers.map((u: any) => [
                                                u.first_name, u.last_name, u.email,
                                                u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
                                            ]);
                                            await downloadExcel('users_report.xlsx', 'Registered Users Report', headers, rows);
                                        }}
                                    >
                                        CSV
                                    </Button>
                                </HStack>
                            </Flex>
                            <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                <Table variant="simple" size="md">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>User ID</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Name</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Email</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Role</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Joined</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, idx) => (
                                                <Tr key={user.id} bg={idx % 2 === 0 ? 'white' : 'gray.50'} _hover={{ bg: 'teal.50' }}>
                                                    <Td py={4}><Text fontFamily="mono" fontSize="sm" fontWeight="600" color="teal.700">{formatUserId(user.id, user.role, user.created_at)}</Text></Td>
                                                    <Td py={4} fontWeight="600">{user.first_name} {user.last_name}</Td>
                                                    <Td py={4}>{user.email}</Td>
                                                    <Td py={4}>
                                                        <Badge colorScheme={(user.role || '').toLowerCase().includes('admin') ? 'red' : (user.role || '').toLowerCase().includes('medic') || (user.role || '').toLowerCase().includes('staff') ? 'blue' : (user.role || '').toLowerCase().includes('doctor') ? 'purple' : 'green'} fontWeight="600" fontSize="xs" px={2} py={1}>
                                                            {(user.role || 'Patient').toLowerCase().includes('admin') ? 'Administrator' : user.role}
                                                        </Badge>
                                                    </Td>
                                                    <Td py={4}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</Td>
                                                    <Td py={4}>
                                                        <HStack spacing={2}>
                                                            {(user?.role || '').toLowerCase().includes('super') ? (
                                                                <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => handleEditClick(user)}>Edit</Button>
                                                            ) : (
                                                                <Button size="sm" colorScheme="teal" variant="outline" onClick={() => handleEditClick(user)}>View</Button>
                                                            )}
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={6} textAlign="center" py={10} color="gray.500" fontSize="sm">No users found.</Td>
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

                            <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                <Table variant="simple" size="md">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Name</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Role</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Specialization</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Schedule</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Status</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredStaff.length > 0 ? (
                                            filteredStaff.map((staff, idx) => (
                                                <Tr key={staff.id} bg={idx % 2 === 0 ? 'white' : 'gray.50'} _hover={{ bg: 'teal.50' }}>
                                                    <Td py={4}>
                                                        <HStack>
                                                            <Avatar size="sm" name={`${staff.first_name} ${staff.last_name}`} />
                                                            <Text fontWeight="600" fontSize="sm">{staff.first_name} {staff.last_name}</Text>
                                                        </HStack>
                                                    </Td>
                                                    <Td py={4}>
                                                        <Badge colorScheme={staff.role === 'Doctor' ? 'blue' : staff.role === 'Nurse' ? 'green' : 'orange'} fontWeight="600" fontSize="xs" px={2} py={1}>
                                                            {staff.role}
                                                        </Badge>
                                                    </Td>
                                                    <Td py={4}>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm" color="gray.800">{staff.specialization || 'General'}</Text>
                                                            {staff.prc_license_number && <Text fontSize="xs" color="gray.500">PRC: {staff.prc_license_number}</Text>}
                                                        </VStack>
                                                    </Td>
                                                    <Td py={4}>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm" color="gray.800">{staff.schedule || 'N/A'}</Text>
                                                            {staff.clinic_room && <Text fontSize="xs" color="gray.500">Rm: {staff.clinic_room}</Text>}
                                                        </VStack>
                                                    </Td>
                                                    <Td py={4}>
                                                        <Badge variant="subtle" colorScheme="green" fontWeight="600" fontSize="xs" px={2} py={1}>Active</Badge>
                                                    </Td>
                                                    <Td py={4}>
                                                        <HStack spacing={2}>
                                                            {(user?.role || '').toLowerCase().includes('super') ? (
                                                                <>
                                                                    <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => handleEditClick(staff)}>Edit</Button>
                                                                    <Button size="sm" variant="ghost" colorScheme="orange" onClick={() => handleResendCredentials(staff.id)}>Resend</Button>
                                                                </>
                                                            ) : (
                                                                <Button size="sm" colorScheme="teal" variant="outline" onClick={() => handleEditClick(staff)}>View</Button>
                                                            )}
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={6} textAlign="center" py={10} color="gray.500" fontSize="sm">No medical staff found.</Td>
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
                // (legacy) immunBarPct removed in favor of charts

                const tbPct = analyticsData?.tb_treatment?.success_pct ?? 0;
                const tbTotal = analyticsData?.tb_treatment?.total ?? 0;

                const prenatalCompareData = [
                    { label: 'Last month', value: prenatalPrev },
                    { label: 'This month', value: prenatalCount },
                ];

                const immunCompareData = [
                    { label: 'Last month', value: immunPrev },
                    { label: 'This month', value: immunCount },
                ];

                const immunBreakdown = analyticsData?.immunization?.breakdown
                    ? Object.entries(analyticsData.immunization.breakdown)
                        .map(([name, value]) => ({ name, value: Number(value) || 0 }))
                        .filter((x: any) => x.value > 0)
                    : [];

                const tbCompleted = analyticsData?.tb_treatment?.completed ?? 0;
                const tbRemaining = Math.max(0, tbTotal - tbCompleted);
                const tbPieData = tbTotal > 0
                    ? [
                        { name: 'Completed', value: tbCompleted },
                        { name: 'Not completed', value: tbRemaining },
                    ]
                    : [];


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
                                onClick={async () => {
                                    const headers = ['Service', 'Total Appointments', 'Upcoming', 'Completed'];
                                    const rows = (predictiveData?.top_services || []).map((s: any) => [
                                        s.service, s.total, s.upcoming, s.completed
                                    ]);
                                    await downloadPDF(
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
                                onClick={async () => {
                                    const headers = ['Service', 'Total Appointments', 'Upcoming', 'Completed'];
                                    const rows = (predictiveData?.top_services || []).map((s: any) => [
                                        s.service, s.total, s.upcoming, s.completed
                                    ]);
                                    await downloadExcel('service_demand_report.xlsx', 'Service Demand Report', headers, rows);
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
                                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
                                    {/* Prenatal chart */}
                                    <Box
                                        bg="white"
                                        p={6}
                                        borderRadius="3xl"
                                        boxShadow="sm"
                                        border="1px solid"
                                        borderColor="gray.100"
                                        cursor="pointer"
                                        transition="all 0.2s"
                                        _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                                        onClick={() => { setSelectedCard('prenatal'); onOpen(); }}
                                    >
                                        <HStack justify="space-between" mb={2}>
                                            <Box>
                                                <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                                                    Prenatal visits
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    How many prenatal checkups were recorded
                                                </Text>
                                            </Box>
                                            <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={3}>
                                                {prenatalCount.toLocaleString()}
                                            </Badge>
                                        </HStack>
                                    <Text fontSize="xs" color="gray.500">
                                        {prenatalPrev > 0 ? `${Math.abs(prenatalChange)}% ${prenatalChange >= 0 ? 'more' : 'less'} than last month` : 'No prior month data'}
                                    </Text>

                                        <Box h="190px" mt={4}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={prenatalCompareData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar name="Visits" dataKey="value" fill="#38b2ac" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>

                                        <Progress value={prenatalBarPct} size="sm" colorScheme="teal" mt={4} borderRadius="full" />
                                        <Text fontSize="xs" mt={2} color="gray.500">
                                            Progress to target: {prenatalCount.toLocaleString()} of {prenatalTarget.toLocaleString()} visits ({prenatalBarPct}%)
                                        </Text>
                                    </Box>

                                    {/* Immunization chart */}
                                    <Box
                                        bg="white"
                                        p={6}
                                        borderRadius="3xl"
                                        boxShadow="sm"
                                        border="1px solid"
                                        borderColor="gray.100"
                                        cursor="pointer"
                                        transition="all 0.2s"
                                        _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                                        onClick={() => { setSelectedCard('immunization'); onOpen(); }}
                                    >
                                        <HStack justify="space-between" mb={2}>
                                            <Box>
                                                <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                                                    Immunization
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    Total immunization appointments (this month)
                                                </Text>
                                            </Box>
                                            <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={3}>
                                                {immunCount.toLocaleString()}
                                            </Badge>
                                        </HStack>
                                    <Text fontSize="xs" color="gray.500">
                                        {immunPrev > 0 ? `${Math.abs(immunChange)}% ${immunChange >= 0 ? 'more' : 'less'} than last month` : 'No prior month data'}
                                    </Text>

                                        <Box h="190px" mt={4}>
                                            {immunBreakdown.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Tooltip />
                                                        <Legend />
                                                        <Pie
                                                            data={immunBreakdown}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            innerRadius={45}
                                                            outerRadius={75}
                                                            paddingAngle={2}
                                                        >
                                                            {immunBreakdown.map((_: any, idx: number) => (
                                                                <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={immunCompareData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                                        <YAxis tick={{ fontSize: 12 }} />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar name="Appointments" dataKey="value" fill="#ed8936" radius={[6, 6, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            )}
                                        </Box>

                                        <Text fontSize="xs" mt={2} color="gray.500">
                                            Tip: Hover the chart to see counts per vaccine/service.
                                        </Text>
                                    </Box>

                                    {/* TB Treatment chart */}
                                    <Box
                                        bg="white"
                                        p={6}
                                        borderRadius="3xl"
                                        boxShadow="sm"
                                        border="1px solid"
                                        borderColor="gray.100"
                                    >
                                        <HStack justify="space-between" mb={2}>
                                            <Box>
                                                <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                                                    TB treatment success
                                                </Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    How many patients completed treatment
                                                </Text>
                                            </Box>
                                            <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3}>
                                                {tbTotal > 0 ? `${tbPct}%` : 'N/A'}
                                            </Badge>
                                        </HStack>

                                        <Box h="190px" mt={4}>
                                            {tbPieData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Tooltip />
                                                        <Legend />
                                                        <Pie
                                                            data={tbPieData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            innerRadius={45}
                                                            outerRadius={75}
                                                            paddingAngle={2}
                                                        >
                                                            <Cell fill="#3182ce" />
                                                            <Cell fill="#e2e8f0" />
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <Flex h="100%" align="center" justify="center">
                                                    <Text color="gray.400" fontSize="sm">
                                                        No TB/DOTS records yet
                                                    </Text>
                                                </Flex>
                                            )}
                                        </Box>

                                        <Text fontSize="xs" mt={2} color="gray.500">
                                            {tbTotal > 0 ? `${tbCompleted} completed out of ${tbTotal} total` : ' '}
                                        </Text>
                                    </Box>

                                    {/* Service charts: 5 more graphs (total 8) */}
                                    {((predictiveData?.top_services || []).slice(0, 5)).map((svc: any, idx: number) => {
                                        const svcChartData = [
                                            { label: 'Total', value: svc.total, fill: CHART_COLORS[0] },
                                            { label: 'Upcoming', value: svc.upcoming, fill: CHART_COLORS[1] },
                                            { label: 'Completed', value: svc.completed, fill: CHART_COLORS[2] },
                                        ].filter((d: any) => d.value > 0);
                                        return (
                                            <Box
                                                key={`svc-${idx}`}
                                                bg="white"
                                                p={6}
                                                borderRadius="3xl"
                                                boxShadow="sm"
                                                border="1px solid"
                                                borderColor="gray.100"
                                            >
                                                <HStack justify="space-between" mb={2}>
                                                    <Box>
                                                        <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                                                            {svc.service}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.600">
                                                            Appointments (last 90 days)
                                                        </Text>
                                                    </Box>
                                                    <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={3}>
                                                        {svc.total}
                                                    </Badge>
                                                </HStack>
                                                <Box h="190px" mt={4}>
                                                    {svcChartData.length > 0 ? (
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart data={svcChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                                                <YAxis tick={{ fontSize: 12 }} />
                                                                <Tooltip />
                                                                <Legend />
                                                                <Bar name="Count" dataKey="value" radius={[6, 6, 0, 0]}>
                                                                    {svcChartData.map((_: any, i: number) => (
                                                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                                    ))}
                                                                </Bar>
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    ) : (
                                                        <Flex h="100%" align="center" justify="center">
                                                            <Text color="gray.400" fontSize="sm">No data yet</Text>
                                                        </Flex>
                                                    )}
                                                </Box>
                                                <Text fontSize="xs" mt={2} color="gray.500">
                                                    {svc.upcoming > 0 ? `${svc.upcoming} upcoming · ` : ''}{svc.completed} completed
                                                </Text>
                                            </Box>
                                        );
                                    })}
                                </SimpleGrid>

                            </>
                        )}

                        {/* ── Predictive Resource Allocation (Looker-style) ─────── */}
                        <Box
                            bg="white"
                            borderRadius="2xl"
                            boxShadow="0 1px 3px rgba(0,0,0,0.06)"
                            border="1px solid"
                            borderColor="gray.100"
                            overflow="hidden"
                        >
                            {/* Header */}
                            <Flex
                                justify="space-between"
                                align="center"
                                px={6}
                                py={4}
                                borderBottom="1px solid"
                                borderColor="gray.100"
                                bg="gray.50"
                            >
                                <HStack spacing={3}>
                                    <Icon as={FiBarChart2} color="gray.600" boxSize={5} />
                                    <Text fontWeight="700" fontSize="md" color="gray.800">
                                        Predictive Resource Allocation
                                    </Text>
                                </HStack>
                                <Badge
                                    bg="purple.50"
                                    color="purple.700"
                                    fontWeight="600"
                                    fontSize="xs"
                                    px={3}
                                    py={1}
                                    borderRadius="md"
                                >
                                    AI-assisted
                                </Badge>
                            </Flex>

                            {/* Compact legend row */}
                            <Flex
                                wrap="wrap"
                                gap={6}
                                px={6}
                                py={3}
                                bg="white"
                                borderBottom="1px solid"
                                borderColor="gray.100"
                                align="center"
                                fontSize="xs"
                                color="gray.500"
                            >
                                <HStack spacing={2}>
                                    <Box w="8px" h="8px" borderRadius="sm" bg="red.500" />
                                    <Text>Critical — Out of stock</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Box w="8px" h="8px" borderRadius="sm" bg="orange.400" />
                                    <Text>Low — &le;10 units</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Box w="8px" h="8px" borderRadius="sm" bg="yellow.400" />
                                    <Text>Watch — High demand</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Box w="8px" h="8px" borderRadius="sm" bg="blue.400" />
                                    <Text>Info</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Box w="8px" h="8px" borderRadius="sm" bg="orange.300" />
                                    <Text>Warning — &ge;3 this week</Text>
                                </HStack>
                            </Flex>

                            {predictiveLoading && (
                                <Flex justify="center" py={12}>
                                    <Spinner color="purple.500" size="lg" />
                                </Flex>
                            )}

                            {!predictiveLoading && predictiveData && (
                                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={0} minH="240px">
                                    {/* Service Demand */}
                                    <Box
                                        p={6}
                                        borderRight={{ lg: '1px solid' }}
                                        borderBottom={{ base: '1px solid', lg: 'none' }}
                                        borderColor="gray.100"
                                    >
                                        <Text
                                            fontWeight="700"
                                            fontSize="xs"
                                            color="gray.500"
                                            textTransform="uppercase"
                                            letterSpacing="wider"
                                            mb={4}
                                        >
                                            Service demand
                                        </Text>
                                        <VStack align="stretch" spacing={4}>
                                            {(predictiveData.top_services || []).slice(0, 5).map((svc: any, i: number) => {
                                                const maxTotal = Math.max(...(predictiveData.top_services || []).map((s: any) => s.total), 1);
                                                const pct = Math.min(100, Math.round((svc.total / maxTotal) * 100));
                                                const isHigh = svc.upcoming >= 3;
                                                const isMedium = svc.upcoming >= 1;
                                                return (
                                                    <Box key={i}>
                                                        <Flex justify="space-between" align="center" mb={1}>
                                                            <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>
                                                                {svc.service}
                                                            </Text>
                                                            <HStack spacing={2}>
                                                                {svc.upcoming > 0 && (
                                                                    <Text fontSize="xs" fontWeight="600" color={isHigh ? "orange.600" : "gray.600"}>
                                                                        {svc.upcoming} upcoming
                                                                    </Text>
                                                                )}
                                                                <Text fontSize="xs" color="gray.400">{svc.total} total</Text>
                                                            </HStack>
                                                        </Flex>
                                                        <Box bg="gray.100" borderRadius="full" h="6px" overflow="hidden">
                                                            <Box
                                                                bg={isHigh ? "orange.400" : isMedium ? "teal.400" : "gray.300"}
                                                                w={`${pct}%`}
                                                                h="100%"
                                                                borderRadius="full"
                                                                transition="width 0.3s"
                                                            />
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                            {(predictiveData.top_services || []).length === 0 && (
                                                <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
                                                    No appointment data yet
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Inventory Forecast */}
                                    <Box
                                        p={6}
                                        borderRight={{ lg: '1px solid' }}
                                        borderBottom={{ base: '1px solid', lg: 'none' }}
                                        borderColor="gray.100"
                                    >
                                        <Text
                                            fontWeight="700"
                                            fontSize="xs"
                                            color="gray.500"
                                            textTransform="uppercase"
                                            letterSpacing="wider"
                                            mb={4}
                                        >
                                            Inventory forecast
                                        </Text>
                                        <VStack align="stretch" spacing={3}>
                                            {(predictiveData.recommended_inventory || []).slice(0, 8).map((inv: any, i: number) => {
                                                const isOut = inv.stock === 0;
                                                const isCritical = inv.status === 'Critical' || isOut;
                                                const isLow = inv.status === 'Low Stock' || inv.stock <= 10;
                                                const dotColor = isCritical ? "red.500" : isLow ? "orange.400" : "yellow.500";
                                                const label = isCritical ? "Critical" : isLow ? "Low" : "Watch";
                                                return (
                                                    <Flex key={i} align="center" justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.50" _last={{ borderBottom: 'none' }}>
                                                        <HStack spacing={3} flex={1} minW={0}>
                                                            <Box w="6px" h="6px" borderRadius="full" bg={dotColor} flexShrink={0} />
                                                            <Box>
                                                                <Text fontSize="sm" fontWeight="500" color="gray.800" noOfLines={1}>{inv.item}</Text>
                                                                <Text fontSize="xs" color="gray.400">{inv.category} · {inv.stock} {inv.unit}</Text>
                                                            </Box>
                                                        </HStack>
                                                        <Text fontSize="xs" fontWeight="600" color={isCritical ? "red.600" : isLow ? "orange.600" : "yellow.700"}>
                                                            {label}
                                                        </Text>
                                                    </Flex>
                                                );
                                            })}
                                            {(predictiveData.recommended_inventory || []).length === 0 && (
                                                <Flex align="center" justify="center" py={8} bg="green.50" borderRadius="lg">
                                                    <Text fontSize="sm" color="green.700" fontWeight="500">
                                                        All inventory levels sufficient
                                                    </Text>
                                                </Flex>
                                            )}
                                        </VStack>
                                    </Box>

                                    {/* Staffing Insights */}
                                    <Box p={6}>
                                        <Text
                                            fontWeight="700"
                                            fontSize="xs"
                                            color="gray.500"
                                            textTransform="uppercase"
                                            letterSpacing="wider"
                                            mb={4}
                                        >
                                            Staffing insights
                                        </Text>
                                        <VStack align="stretch" spacing={3}>
                                            {(predictiveData.staffing_alerts || []).map((alert: any, i: number) => (
                                                <Flex
                                                    key={i}
                                                    p={3}
                                                    borderRadius="lg"
                                                    bg={alert.level === 'warning' ? "orange.50" : "blue.50"}
                                                    align="flex-start"
                                                    borderLeft="3px solid"
                                                    borderColor={alert.level === 'warning' ? "orange.400" : "blue.400"}
                                                >
                                                    <Icon
                                                        as={alert.level === 'warning' ? FiAlertTriangle : FiActivity}
                                                        color={alert.level === 'warning' ? "orange.500" : "blue.500"}
                                                        boxSize={4}
                                                        mt="2px"
                                                        mr={2}
                                                    />
                                                    <Text fontSize="sm" color="gray.700" lineHeight="tall">{alert.message}</Text>
                                                </Flex>
                                            ))}
                                            {(predictiveData.staffing_alerts || []).length === 0 && (
                                                <Text fontSize="sm" color="gray.400" py={6} textAlign="center">
                                                    No alerts at this time
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>
                                </SimpleGrid>
                            )}

                            {!predictiveLoading && !predictiveData && (
                                <Flex py={12} justify="center" align="center">
                                    <Text fontSize="sm" color="gray.500">Could not load predictive data. Please try refreshing.</Text>
                                </Flex>
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
                            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                                <HStack spacing={6} align="center">
                                    <Heading size="md" color="teal.800">Recent Tickets</Heading>
                                    <Text fontSize="sm" color="gray.500">Showing {ticketFilter === 'open' ? 'open' : 'resolved'} inquiries</Text>
                                </HStack>
                                <HStack bg="gray.100" p={1} borderRadius="lg">
                                    <Button
                                        size="sm"
                                        variant={ticketFilter === 'open' ? 'solid' : 'ghost'}
                                        colorScheme={ticketFilter === 'open' ? 'teal' : 'gray'}
                                        onClick={() => setTicketFilter('open')}
                                        borderRadius="md"
                                    >
                                        Open
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
                            </Flex>
                            <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="gray.100">
                                <Table variant="simple" size="md">
                                    <Thead bg="gray.50">
                                        <Tr>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Ticket</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Date</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Contact</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Subject</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Message</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Status</Th>
                                            <Th fontSize="xs" fontWeight="700" color="gray.600" textTransform="uppercase" letterSpacing="wider" py={4}>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredTickets.length > 0 ? (
                                            filteredTickets.map((ticket, idx) => (
                                                <Tr
                                                    key={ticket.id}
                                                    bg={idx % 2 === 0 ? 'white' : 'gray.50'}
                                                    _hover={{ bg: 'teal.50' }}
                                                >
                                                    <Td py={4} whiteSpace="nowrap">
                                                        <Text fontFamily="mono" fontWeight="600" fontSize="sm" color="teal.700">
                                                            TCKT-{new Date(ticket.created_at).getFullYear()}-{ticket.id.toString().padStart(3, '0')}
                                                        </Text>
                                                    </Td>
                                                    <Td py={4}>
                                                        <Text fontSize="sm" color="gray.700">{new Date(ticket.created_at).toLocaleDateString()}</Text>
                                                    </Td>
                                                    <Td py={4}>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="600" fontSize="sm" color="gray.800">{ticket.name}</Text>
                                                            <Text fontSize="xs" color="gray.500" noOfLines={1}>{ticket.email}</Text>
                                                            {ticket.phone && (
                                                                <Text fontSize="xs" color="gray.400">{ticket.phone}</Text>
                                                            )}
                                                        </VStack>
                                                    </Td>
                                                    <Td py={4} maxW="180px">
                                                        <Text fontWeight="600" fontSize="sm" color="gray.800" noOfLines={1}>{ticket.subject}</Text>
                                                    </Td>
                                                    <Td py={4} maxW="220px">
                                                        <Text fontSize="sm" color="gray.600" noOfLines={2} lineHeight="tall">{ticket.message}</Text>
                                                    </Td>
                                                    <Td py={4}>
                                                        <Badge
                                                            colorScheme={ticket.status === 'Resolved' ? 'green' : 'orange'}
                                                            fontWeight="600"
                                                            fontSize="xs"
                                                            px={2}
                                                            py={1}
                                                        >
                                                            {ticket.status}
                                                        </Badge>
                                                    </Td>
                                                    <Td py={4}>
                                                        {ticket.status !== 'Resolved' && (
                                                            <Button size="sm" colorScheme="teal" onClick={() => confirmResolveTicket(ticket.id)}>
                                                                Mark Resolved
                                                            </Button>
                                                        )}
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={7} textAlign="center" py={10} color="gray.500" fontSize="sm">
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

            <Modal isOpen={isOpen} onClose={onClose} size={selectedCard === 'all-logs' ? '5xl' : 'xl'} scrollBehavior="inside">
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
