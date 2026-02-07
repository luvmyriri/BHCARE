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
} from 'react-icons/fi';

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

const AdminStatCard = ({ label, value, icon, color }: any) => (
    <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
        flex="1"
        minW="200px"
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
                            <AdminStatCard label="Total Users" value="156" icon={FiUsers} color="teal" />
                            <AdminStatCard label="Active Doctors" value="8" icon={FiActivity} color="orange" />
                            <AdminStatCard label="Today's Appointments" value="42" icon={FiCalendar} color="blue" />
                            <AdminStatCard label="System Health" value="98%" icon={FiBarChart2} color="green" />
                        </Flex>

                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md" color="teal.800">Recent System Activities</Heading>
                                <Button size="sm" colorScheme="orange" variant="outline" leftIcon={<FiBarChart2 />}>View All Logs</Button>
                            </Flex>
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
                    <VStack align="stretch">
                        <PageHero
                            badge="ANALYTICS & REPORTS"
                            title="Health Center Performance"
                            description="Comprehensive analytics, reports, and insights on health center operations and patient care."
                        />
                        <Flex h="300px" align="center" justify="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.400">Analytics Dashboard Integration in Progress</Text>
                        </Flex>
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
                    <VStack align="start" spacing={0}>
                        <Heading size="md" color="teal.800" textTransform="capitalize">
                            {activeTab.replace('-', ' ')}
                        </Heading>
                        <Text color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                            Administration Control Panel
                        </Text>
                    </VStack>
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
        </Box>
    );
};

export default AdminDashboard;
