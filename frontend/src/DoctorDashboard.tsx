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
    FiClipboard,
    FiBox,
} from 'react-icons/fi';

interface DoctorDashboardProps {
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

const DoctorStatCard = ({ label, value, icon, color }: any) => (
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
            as={FiActivity}
            position="absolute"
            right="-20px"
            bottom="-20px"
            boxSize="200px"
            opacity={0.15}
            transform="rotate(-15deg)"
        />
    </Box>
);

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const patients = [
        { id: 1, name: 'Juan Dela Cruz', status: 'Waiting', time: '09:00 AM', reason: 'Flu Symptoms' },
        { id: 2, name: 'Maria Santos', status: 'Consulting', time: '09:30 AM', reason: 'Check-up' },
        { id: 3, name: 'Ricard Gomez', status: 'Scheduled', time: '10:00 AM', reason: 'Vaccination' },
        { id: 4, name: 'Elena Perkins', status: 'Scheduled', time: '10:30 AM', reason: 'Pregnancy Follow-up' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <VStack align="stretch" spacing={8}>
                        <PageHero
                            badge="CLINIC ACTIVE"
                            title={`Dr. ${user?.last_name || 'Medical Officer'}'s Station 🩺`}
                            description="You have 8 consultations scheduled for today. 2 patients are currently in the waiting area."
                        />

                        <Flex gap={6} flexWrap="wrap">
                            <DoctorStatCard label="Patients Today" value="8" icon={FiUsers} color="teal" />
                            <DoctorStatCard label="Consultations Done" value="2" icon={FiClipboard} color="orange" />
                            <DoctorStatCard label="Critical Cases" value="0" icon={FiActivity} color="red" />
                            <DoctorStatCard label="Pending Lab Results" value="14" icon={FiBox} color="orange" />
                        </Flex>

                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6}>
                                <Heading size="md" color="teal.800">Current Patient Queue</Heading>
                                <Button size="sm" colorScheme="orange" variant="outline" leftIcon={<FiCalendar />}>View Schedule</Button>
                            </Flex>
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
                                    {patients.map(p => (
                                        <Tr key={p.id}>
                                            <Td fontWeight="600">{p.name}</Td>
                                            <Td>{p.time}</Td>
                                            <Td>{p.reason}</Td>
                                            <Td>
                                                <Badge
                                                    colorScheme={p.status === 'Consulting' ? 'green' : p.status === 'Waiting' ? 'orange' : 'gray'}
                                                    borderRadius="full"
                                                    px={3}
                                                >
                                                    {p.status}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                <Button size="xs" colorScheme="teal" variant="ghost">View Details</Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </VStack>
                );
            case 'patients':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge="PATIENT REGISTRY"
                            title="Patient Records Management"
                            description="Search, view, and update comprehensive medical histories for all registered community members."
                        />
                        <Flex h="300px" align="center" justify="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.400">Registry Module Integration in Progress</Text>
                        </Flex>
                    </VStack>
                );
            case 'schedule':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge="CLINIC SCHEDULE"
                            title="Duty and Consultation Hours"
                            description="Manage your clinic availability and view upcoming appointments in a detailed calendar view."
                        />
                        <Flex h="300px" align="center" justify="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.400">Scheduling Module Integration in Progress</Text>
                        </Flex>
                    </VStack>
                );
            case 'records':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge="MEDICAL HISTORY"
                            title="Clinical Logs & Archives"
                            description="Review past consultations, prescriptions, and diagnostic results for patient longitudinal care."
                        />
                        <Flex h="300px" align="center" justify="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.400">Medical Archives Module Integration in Progress</Text>
                        </Flex>
                    </VStack>
                );
            case 'inventory':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge="PHARMACY INVENTORY"
                            title="Medicine & Equipment Stock"
                            description="Track available vaccinations, medicines, and first-aid supplies within the health center."
                        />
                        <Flex h="300px" align="center" justify="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.400">Pharmacy Module Integration in Progress</Text>
                        </Flex>
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
                    <VStack align="start" spacing={0}>
                        <Heading size="md" color="teal.800" textTransform="capitalize">
                            {activeTab.replace('-', ' ')}
                        </Heading>
                        <Text color="gray.400" fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                            Medical Control Center
                        </Text>
                    </VStack>
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
        </Box>
    );
};

export default DoctorDashboard;
