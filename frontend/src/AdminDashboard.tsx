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
    FiTrendingUp,
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
        p={10}
        borderRadius="3xl"
        color="white"
        boxShadow="xl"
        position="relative"
        overflow="hidden"
        mb={8}
    >
        <Box position="relative" zIndex={1}>
            <HStack spacing={4} mb={2}>
                <Badge colorScheme="orange" variant="solid" px={3} borderRadius="full">{badge}</Badge>
                <Text fontSize="sm" fontWeight="600" opacity={0.8}>Brgy. 174 Health Center</Text>
            </HStack>
            <Heading size="xl" mb={4}>
                {title}
            </Heading>
            <Text fontSize="lg" opacity={0.9} maxW="lg">
                {description}
            </Text>
        </Box>
        <Icon
            as={FiShield}
            position="absolute"
            right="-20px"
            bottom="-20px"
            boxSize="200px"
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

    const handleCardClick = (card: string) => {
        setSelectedCard(card);
        onOpen();
    };

    const renderModalContent = () => {
        switch (selectedCard) {
            case 'users':
                return (
                    <>
                        <ModalHeader>Total Users Breakdown</ModalHeader>
                        <ModalBody>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Category</Th><Th isNumeric>Count</Th></Tr></Thead>
                                    <Tbody>
                                        <Tr><Td>Residents (Barangay 174)</Td><Td isNumeric>120</Td></Tr>
                                        <Tr><Td>Non-Residents</Td><Td isNumeric>36</Td></Tr>
                                        <Tr><Td fontWeight="bold">Total</Td><Td isNumeric fontWeight="bold">156</Td></Tr>
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
                                        <Tr><Td>Dr. Maria Santos</Td><Td>General Physician</Td><Td><Badge colorScheme="green">On Duty</Badge></Td></Tr>
                                        <Tr><Td>Dr. Ricardo Gomez</Td><Td>Pediatrician</Td><Td><Badge colorScheme="green">On Duty</Badge></Td></Tr>
                                        <Tr><Td>Nurse Joyce</Td><Td>Head Nurse</Td><Td><Badge colorScheme="green">On Duty</Badge></Td></Tr>
                                        <Tr><Td>Dr. Elena</Td><Td>OB-GYN</Td><Td><Badge colorScheme="orange">Break</Badge></Td></Tr>
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
                                        <Tr><Td>08:00 AM</Td><Td>Juan Dela Cruz</Td><Td>Check-up</Td></Tr>
                                        <Tr><Td>08:30 AM</Td><Td>Maria Clara</Td><Td>Prenatal</Td></Tr>
                                        <Tr><Td>09:00 AM</Td><Td>Jose Rizal</Td><Td>Vaccination</Td></Tr>
                                        <Tr><Td>09:30 AM</Td><Td>Andres B.</Td><Td>Follow-up</Td></Tr>
                                    </Tbody>
                                </Table>
                            </Box>
                            <Box mt={4}>
                                <Text fontSize="sm" color="gray.500" fontStyle="italic">Showing first 4 of 42 appointments...</Text>
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
                                    <Badge colorScheme="green">Stable</Badge>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>API Latency</Text>
                                    <Text fontSize="sm">45ms</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>Server Uptime</Text>
                                    <Text fontSize="sm">14 days, 2 hrs</Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>Last Backup</Text>
                                    <Text fontSize="sm">Today, 03:00 AM</Text>
                                </HStack>
                            </VStack>
                        </ModalBody>
                    </>
                );
            // FHSIS Modal Content
            case 'prenatal':
                return (
                    <>
                        <ModalHeader>Prenatal Care Details</ModalHeader>
                        <ModalBody>
                            <Text mb={4} fontSize="sm" color="gray.600">List of mothers with upcoming expected delivery dates (EDD).</Text>
                            <Box overflowX="auto">
                                <Table variant="simple" size="sm">
                                    <Thead><Tr><Th>Patient</Th><Th>Trimester</Th><Th>EDD</Th></Tr></Thead>
                                    <Tbody>
                                        <Tr><Td>Juana Cruz</Td><Td>3rd</Td><Td>Feb 28, 2026</Td></Tr>
                                        <Tr><Td>Maria Santos</Td><Td>2rd</Td><Td>May 15, 2026</Td></Tr>
                                        <Tr><Td>Elena Gil</Td><Td>1st</Td><Td>Sep 10, 2026</Td></Tr>
                                    </Tbody>
                                </Table>
                            </Box>
                        </ModalBody>
                    </>
                );
            case 'immunization':
                return (
                    <>
                        <ModalHeader>Immunization Targets</ModalHeader>
                        <ModalBody>
                            <VStack align="stretch" spacing={3}>
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold">BCG Vaccine</Text>
                                    <Progress value={95} size="sm" colorScheme="green" />
                                    <Text fontSize="xs" align="right">95% (Target met)</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold">Hepatitis B</Text>
                                    <Progress value={88} size="sm" colorScheme="orange" />
                                    <Text fontSize="xs" align="right">88% (Gap: 7%)</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold">Oral Polio</Text>
                                    <Progress value={92} size="sm" colorScheme="teal" />
                                    <Text fontSize="xs" align="right">92% (On track)</Text>
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

    const recentActivities = [
        { id: 1, user: 'Dr. Maria Santos', action: 'Updated patient record', time: '5 mins ago', type: 'update' },
        { id: 2, user: 'Juan Dela Cruz', action: 'New appointment booked', time: '15 mins ago', type: 'new' },
        { id: 3, user: 'Dr. Ricardo Gomez', action: 'Completed consultation', time: '30 mins ago', type: 'complete' },
        { id: 4, user: 'System', action: 'Daily backup completed', time: '1 hour ago', type: 'system' },
    ];

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

                        <Flex gap={6} flexWrap="wrap">
                            <AdminStatCard
                                label="Total Users"
                                value="156"
                                icon={FiUsers}
                                color="teal"
                                onClick={() => handleCardClick('users')}
                            />
                            <AdminStatCard label="Active Doctors" value="8" icon={FiActivity} color="orange" onClick={() => handleCardClick('doctors')} />
                            <AdminStatCard label="Today's Appointments" value="42" icon={FiCalendar} color="blue" onClick={() => handleCardClick('appointments')} />
                            <AdminStatCard label="System Health" value="98%" icon={FiBarChart2} color="green" onClick={() => handleCardClick('system')} />
                        </Flex>

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
                                        {recentActivities.map(a => (
                                            <Tr key={a.id}>
                                                <Td fontWeight="600">{a.user}</Td>
                                                <Td>{a.action}</Td>
                                                <Td>{a.time}</Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={
                                                            a.type === 'new' ? 'green' :
                                                                a.type === 'update' ? 'blue' :
                                                                    a.type === 'complete' ? 'orange' : 'gray'
                                                        }
                                                        borderRadius="full"
                                                        px={3}
                                                    >
                                                        {a.type}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <Button size="xs" colorScheme="teal" variant="ghost">View</Button>
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
                        <Flex h="300px" align="center" justify="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.400">User Management Module Integration in Progress</Text>
                        </Flex>
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
                        <Flex h="300px" align="center" justify="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.400">Staff Management Module Integration in Progress</Text>
                        </Flex>
                    </VStack>
                );
            case 'analytics':
                return (
                    <VStack align="stretch" spacing={8}>
                        <PageHero
                            badge="FHSIS REPORTING"
                            title="Field Health Services Information System"
                            description="Real-time tracking of public health programs, immunization targets, and morbidity statistics complying with DOH standards."
                        />

                        {/* Summary Cards */}
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                            <Box
                                bg="white" p={6} borderRadius="2xl" boxShadow="sm" borderLeft="4px solid" borderColor="teal.500"
                                cursor="pointer" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                                onClick={() => handleCardClick('prenatal')}
                            >
                                <Stat>
                                    <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">Prenatal Care Visits</StatLabel>
                                    <StatNumber fontSize="3xl" color="teal.700">1,248</StatNumber>
                                    <StatHelpText>
                                        <StatArrow type="increase" />
                                        23.36% vs last month
                                    </StatHelpText>
                                </Stat>
                                <Progress value={78} size="xs" colorScheme="teal" mt={4} borderRadius="full" />
                                <Text fontSize="xs" mt={2} color="gray.400">Target: 1,600 visits</Text>
                            </Box>

                            <Box
                                bg="white" p={6} borderRadius="2xl" boxShadow="sm" borderLeft="4px solid" borderColor="orange.500"
                                cursor="pointer" transition="all 0.2s" _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                                onClick={() => handleCardClick('immunization')}
                            >
                                <Stat>
                                    <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">Fully Immunized Children</StatLabel>
                                    <StatNumber fontSize="3xl" color="orange.700">856</StatNumber>
                                    <StatHelpText>
                                        <StatArrow type="increase" />
                                        12.05% vs last month
                                    </StatHelpText>
                                </Stat>
                                <Progress value={92} size="xs" colorScheme="orange" mt={4} borderRadius="full" />
                                <Text fontSize="xs" mt={2} color="gray.400">Target: 95% Coverage</Text>
                            </Box>

                            <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" borderLeft="4px solid" borderColor="blue.500">
                                <Stat>
                                    <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase">TB Treatment Success</StatLabel>
                                    <StatNumber fontSize="3xl" color="blue.700">94%</StatNumber>
                                    <StatHelpText>
                                        <StatArrow type="increase" />
                                        5.1% vs last month
                                    </StatHelpText>
                                </Stat>
                                <Progress value={94} size="xs" colorScheme="blue" mt={4} borderRadius="full" />
                                <Text fontSize="xs" mt={2} color="gray.400">DOH Target: &gt;90%</Text>
                            </Box>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                            {/* Morbidity Report */}
                            <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm">
                                <Flex justify="space-between" align="center" mb={6}>
                                    <HStack>
                                        <Icon as={FiAlertTriangle} color="red.500" />
                                        <Heading size="md" color="gray.700">Top 10 Morbidity (Illnesses)</Heading>
                                    </HStack>
                                    <Badge colorScheme="red">Live Data</Badge>
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
                                            {[
                                                { name: 'Upper Respiratory Tract Infection', cases: 452, trend: 'up' },
                                                { name: 'Essential Hypertension', cases: 328, trend: 'stable' },
                                                { name: 'Acute Gastroenteritis', cases: 156, trend: 'down' },
                                                { name: 'Diabetes Mellitus Type 2', cases: 142, trend: 'up' },
                                                { name: 'Bronchitis', cases: 98, trend: 'down' },
                                            ].map((d, i) => (
                                                <Tr key={i}>
                                                    <Td fontWeight="bold" color="gray.500">#{i + 1}</Td>
                                                    <Td fontWeight="600">{d.name}</Td>
                                                    <Td isNumeric fontWeight="bold">{d.cases}</Td>
                                                    <Td>
                                                        <Badge colorScheme={d.trend === 'up' ? 'red' : d.trend === 'down' ? 'green' : 'gray'}>
                                                            {d.trend === 'up' ? 'Rising' : d.trend === 'down' ? 'Falling' : 'Stable'}
                                                        </Badge>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>

                            {/* Disease Map / Heatmap Placeholder */}
                            <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm">
                                <Flex justify="space-between" align="center" mb={6}>
                                    <HStack>
                                        <Icon as={FiMap} color="teal.500" />
                                        <Heading size="md" color="gray.700">Disease Heatmap (Dengue)</Heading>
                                    </HStack>
                                    <Button size="xs" rightIcon={<FiTrendingUp />}>View Full Map</Button>
                                </Flex>

                                <Box
                                    h="300px"
                                    bg="gray.100"
                                    borderRadius="xl"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bgImage="linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Caloocan_City_Barangays.png/1200px-Caloocan_City_Barangays.png')"
                                    bgSize="cover"
                                    bgPosition="center"
                                    position="relative"
                                >
                                    <Box position="absolute" top="40%" left="30%" bg="red.500" w="40px" h="40px" borderRadius="full" opacity="0.6" filter="blur(8px)" />
                                    <Box position="absolute" top="50%" left="60%" bg="red.500" w="60px" h="60px" borderRadius="full" opacity="0.5" filter="blur(10px)" />
                                    <Box position="absolute" top="20%" left="50%" bg="red.500" w="30px" h="30px" borderRadius="full" opacity="0.7" filter="blur(6px)" />

                                    <Box bg="white" p={4} borderRadius="lg" boxShadow="lg" maxW="200px">
                                        <Text fontWeight="bold" fontSize="sm" mb={2}>Hotspot Alert</Text>
                                        <HStack spacing={2} mb={1}>
                                            <Box w="3" h="3" borderRadius="full" bg="red.500" />
                                            <Text fontSize="xs">Northville 2B (High)</Text>
                                        </HStack>
                                        <HStack spacing={2}>
                                            <Box w="3" h="3" borderRadius="full" bg="orange.400" />
                                            <Text fontSize="xs">Bagumbong (Medium)</Text>
                                        </HStack>
                                    </Box>
                                </Box>
                            </Box>
                        </SimpleGrid>
                    </VStack>

                );
            case 'settings':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge="SYSTEM CONFIGURATION"
                            title="Settings & Preferences"
                            description="Configure system-wide settings, integrations, and operational parameters."
                        />
                        <Flex h="300px" align="center" justify="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.400">System Settings Module Integration in Progress</Text>
                        </Flex>
                    </VStack>
                );
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
                    <NavItem icon={FiSettings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                        System Settings
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
                                <NavItem icon={FiSettings} active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); onSidebarClose(); }}>
                                    System Settings
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
        </Box>
    );
};

export default AdminDashboard;
