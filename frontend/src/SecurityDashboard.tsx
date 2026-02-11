import React, { useState, useEffect } from 'react';
import {
    FiHome,
    FiLogOut,
    FiUserPlus,
    FiClock,
    FiActivity,
    FiCheckCircle,
    FiShield,
    FiMenu,
} from 'react-icons/fi';
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
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    useToast,
    SimpleGrid,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    IconButton,
} from '@chakra-ui/react';

interface SecurityDashboardProps {
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

const PageHero = ({ title, description, badge, icon }: any) => (
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
                <Text fontSize="sm" fontWeight="600" opacity={0.8}>BHCare Security Command</Text>
            </HStack>
            <Heading size="xl" mb={4}>
                {title}
            </Heading>
            <Text fontSize="lg" opacity={0.9} maxW="lg">
                {description}
            </Text>
        </Box>
        <Icon
            as={icon}
            position="absolute"
            right="-20px"
            bottom="-20px"
            boxSize="200px"
            opacity={0.15}
            transform="rotate(-15deg)"
        />
    </Box>
);

const SecurityStatCard = ({ label, value, icon, color, onClick }: any) => (
    <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
        cursor={onClick ? "pointer" : "default"}
        onClick={onClick}
        transition="all 0.2s"
        _hover={{ transform: "translateY(-2px)", boxShadow: onClick ? "md" : "sm" }}
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

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('lobby');
    const [visitorsToday, setVisitorsToday] = useState(0);
    const [occupancy, setOccupancy] = useState(0);
    const [queue, setQueue] = useState<any[]>([]);
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
    const [visitorName, setVisitorName] = useState('');
    const [purpose, setPurpose] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchStats();
        fetchQueue();
        const interval = setInterval(() => {
            fetchStats();
            fetchQueue();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/visits/daily-stats');
            if (res.ok) {
                const data = await res.json();
                setVisitorsToday(data.total_visitors);
                setOccupancy(data.current_occupancy);
            }
        } catch (e) { console.error(e); }
    };

    const fetchQueue = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await fetch(`/api/appointments?date=${today}`);
            if (res.ok) {
                const data = await res.json();
                setQueue(data);
            }
        } catch (e) { console.error(e); }
    };

    const handleCheckIn = async (appointmentId: number) => {
        try {
            const res = await fetch(`/api/appointments/${appointmentId}/check-in`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                toast({
                    title: 'Queue Number Generated',
                    description: `Patient is now #${String(data.queue_number).padStart(3, '0')}`,
                    status: 'success',
                });
                fetchQueue();
            }
        } catch (e) {
            toast({ title: 'Check-in Failed', status: 'error' });
        }
    };

    const handleLogEntry = async () => {
        if (!visitorName || !purpose) return;
        try {
            // 1. Log the visit for headcount
            const logRes = await fetch('/api/visits/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitor_name: visitorName, purpose, type: 'entry' })
            });

            if (!logRes.ok) throw new Error('Failed to log visit');

            // 2. If purpose is medical, add to doctor's queue as a walk-in
            const medicalPurposes = ['Consultation', 'Vaccination', 'Laboratory'];
            if (medicalPurposes.includes(purpose)) {
                const nameParts = visitorName.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Walk-in';

                const walkInRes = await fetch('/api/queue/walk-in', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        first_name: firstName,
                        last_name: lastName,
                        service_type: purpose
                    })
                });

                if (walkInRes.ok) {
                    const walkInData = await walkInRes.json();
                    // Auto check-in the walk-in to get a queue number
                    await fetch(`/api/appointments/${walkInData.appointment_id}/check-in`, { method: 'POST' });
                }
            }

            toast({
                title: 'Check-in Successful',
                description: medicalPurposes.includes(purpose) ? 'Added to medical queue' : 'Visitor logged',
                status: 'success',
                duration: 3000
            });

            setVisitorName('');
            setPurpose('');
            onModalClose();
            fetchStats();
            fetchQueue();
        } catch (e) {
            toast({ title: 'Check-in Failed', status: 'error' });
        }
    };

    const activeQueue = queue.filter(p => p.status === 'waiting' || p.status === 'consulting');
    const pendingArrivals = queue.filter(p => p.status === 'pending' || p.status === 'scheduled');

    const SidebarContent = () => (
        <Box h="full">
            <Flex h="20" align="center" mx="8" mb={8}>
                <HStack spacing={3}>
                    <img src="/images/Logo.png" alt="Logo" style={{ height: '32px' }} />
                    <Text fontSize="xl" fontWeight="800" color="teal.800" letterSpacing="tight">
                        BHCare <Text as="span" color="orange.500" fontSize="xs">SECURITY</Text>
                    </Text>
                </HStack>
            </Flex>
            <VStack spacing={2} align="stretch" px={4}>
                <NavItem icon={FiHome} active={activeTab === 'lobby'} onClick={() => { setActiveTab('lobby'); onSidebarClose(); }}>
                    Lobby Overview
                </NavItem>
                <NavItem icon={FiActivity} active={activeTab === 'arrivals'} onClick={() => { setActiveTab('arrivals'); onSidebarClose(); }}>
                    Arrivals Today
                </NavItem>
                <NavItem icon={FiClock} active={activeTab === 'queue'} onClick={() => { setActiveTab('queue'); onSidebarClose(); }}>
                    Live Queue
                </NavItem>
            </VStack>
            <Box pos="absolute" bottom="8" w="full" px={4}>
                <Divider mb={4} />
                <NavItem icon={FiLogOut} onClick={onLogout}>
                    Logout
                </NavItem>
            </Box>
        </Box>
    );

    return (
        <Box minH="100vh" bg="#f7fafc">
            {/* Sidebar Desktop */}
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
                <SidebarContent />
            </Box>

            {/* Mobile Sidebar */}
            <Drawer isOpen={isSidebarOpen} placement="left" onClose={onSidebarClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerBody p={0}>
                        <SidebarContent />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

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
                                {activeTab.replace('-', ' ')} Security Center
                            </Heading>
                            <Text color="gray.400" fontSize="sm">
                                Station 1 • Main Entrance
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack spacing={4}>
                        <VStack align="end" spacing={0} mr={2}>
                            <Text fontWeight="700" color="teal.800" fontSize="sm">
                                Officer {user?.last_name || '1741'}
                            </Text>
                            <Text color="teal.500" fontSize="xs" fontWeight="700">
                                On Duty
                            </Text>
                        </VStack>
                        <Avatar size="md" icon={<FiShield />} bg="teal.500" color="white" border="2px solid white" boxShadow="md" />
                    </HStack>
                </Flex>

                {activeTab === 'lobby' && (
                    <PageHero
                        title="Lobby Overview"
                        description="Real-time monitoring of facility capacity and visitor flow. Ensure standard entry protocols are followed."
                        badge="Live Monitoring"
                        icon={FiShield}
                    />
                )}
                {activeTab === 'arrivals' && (
                    <PageHero
                        title="Arrivals Today"
                        description="View and manage scheduled appointments for today. Verify patient identity before generating queue tickets."
                        badge="Check-in Desk"
                        icon={FiActivity}
                    />
                )}
                {activeTab === 'queue' && (
                    <PageHero
                        title="Live Service Queue"
                        description="Current status of patients in the medical queue. Monitor waiting times and service progress."
                        badge="Queue Status"
                        icon={FiClock}
                    />
                )}

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
                    <SecurityStatCard
                        label="Total Visitors"
                        value={visitorsToday}
                        icon={FiActivity}
                        color="teal"
                    />
                    <SecurityStatCard
                        label="Active Occupancy"
                        value={occupancy}
                        icon={FiActivity}
                        color="orange"
                    />
                    <Box
                        bg="teal.500"
                        p={6}
                        borderRadius="2xl"
                        boxShadow="lg"
                        color="white"
                        cursor="pointer"
                        onClick={onModalOpen}
                        _hover={{ bg: 'teal.600', transform: 'translateY(-2px)', boxShadow: 'xl' }}
                        transition="all 0.2s"
                    >
                        <Flex justify="space-between" align="center" h="full">
                            <VStack align="start" spacing={1}>
                                <Text fontWeight="700" fontSize="lg">Log New Visitor</Text>
                                <Text fontSize="xs" opacity={0.8}>Standard Entry & Walk-ins</Text>
                            </VStack>
                            <Icon as={FiUserPlus} boxSize={8} />
                        </Flex>
                    </Box>
                </SimpleGrid>

                {activeTab === 'arrivals' && (
                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                        <Heading size="sm" color="teal.800" mb={6} textTransform="uppercase" letterSpacing="widest">
                            Appointments for Check-in
                        </Heading>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th color="gray.400" fontSize="xs">Expected Time</Th>
                                    <Th color="gray.400" fontSize="xs">Patient Name</Th>
                                    <Th color="gray.400" fontSize="xs">Service</Th>
                                    <Th color="gray.400" fontSize="xs">Action</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {pendingArrivals.length > 0 ? pendingArrivals.map((p, idx) => (
                                    <Tr key={idx} _hover={{ bg: 'gray.50' }}>
                                        <Td fontWeight="600" color="teal.700">{p.appointment_time}</Td>
                                        <Td fontWeight="700" color="gray.700">{p.first_name} {p.last_name}</Td>
                                        <Td>
                                            <Badge borderRadius="full" px={3} py={1} colorScheme="teal" variant="subtle">
                                                {p.service_type || 'Consultation'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Button size="sm" colorScheme="orange" leftIcon={<FiCheckCircle />} borderRadius="full" onClick={() => handleCheckIn(p.id)}>
                                                Check-in
                                            </Button>
                                        </Td>
                                    </Tr>
                                )) : (
                                    <Tr><Td colSpan={4} textAlign="center" py={10} color="gray.400">No arrivals pending for today</Td></Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {activeTab === 'queue' && (
                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                        <Heading size="sm" color="teal.800" mb={6} textTransform="uppercase" letterSpacing="widest">
                            Medical Service Queue
                        </Heading>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th color="gray.400" fontSize="xs">Ticket #</Th>
                                    <Th color="gray.400" fontSize="xs">Patient Name</Th>
                                    <Th color="gray.400" fontSize="xs">Purpose</Th>
                                    <Th color="gray.400" fontSize="xs">Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {activeQueue.length > 0 ? activeQueue.map((p, idx) => (
                                    <Tr key={idx} _hover={{ bg: 'gray.50' }}>
                                        <Td>
                                            <Badge fontSize="md" px={3} py={1} borderRadius="lg" colorScheme="orange" variant="solid">
                                                #{String(p.queue_number || idx + 1).padStart(3, '0')}
                                            </Badge>
                                        </Td>
                                        <Td fontWeight="700" color="gray.700">{p.first_name} {p.last_name}</Td>
                                        <Td color="teal.600" fontWeight="600">{p.service_type || 'Consultation'}</Td>
                                        <Td>
                                            <Badge colorScheme={p.status === 'consulting' ? 'green' : 'orange'} borderRadius="full" px={3}>
                                                {p.status}
                                            </Badge>
                                        </Td>
                                    </Tr>
                                )) : (
                                    <Tr><Td colSpan={4} textAlign="center" py={10} color="gray.400">Queue is currently empty</Td></Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                )}

                {activeTab === 'lobby' && (
                    <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                        <Heading size="sm" color="teal.800" mb={4} textTransform="uppercase" letterSpacing="widest">
                            Lobby Intelligence
                        </Heading>
                        <Text color="gray.500" mb={6}>Real-time monitoring of facility capacity and visitor flow.</Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                            <VStack align="start" spacing={4}>
                                <Text fontWeight="700" color="gray.700">Capacity Breakdown</Text>
                                <Box w="full" bg="gray.100" h="10px" borderRadius="full" overflow="hidden">
                                    <Box w={`${(occupancy / 40) * 100}%`} bg="orange.400" h="full" transition="width 0.5s" />
                                </Box>
                                <HStack justify="space-between" w="full">
                                    <Text fontSize="xs" fontWeight="700" color="gray.400">{occupancy} In-house</Text>
                                    <Text fontSize="xs" fontWeight="700" color="gray.400">Max Capacity: 40</Text>
                                </HStack>
                            </VStack>
                            <Box bg="blue.50" p={4} borderRadius="xl" borderLeft="4px solid" borderColor="blue.400">
                                <HStack>
                                    <Icon as={FiClock} color="blue.500" />
                                    <Text fontSize="sm" fontWeight="600" color="blue.700">Peak hour detected: 10:00 AM - 2:00 PM</Text>
                                </HStack>
                            </Box>
                        </SimpleGrid>
                    </Box>
                )}
            </Box>

            {/* Check-in Modal */}
            <Modal isOpen={isModalOpen} onClose={onModalClose}>
                <ModalOverlay />
                <ModalContent borderRadius="2xl">
                    <ModalHeader>Visitor Check-in</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Visitor Full Name</FormLabel>
                                <Input placeholder="Enter name" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Purpose of Visit</FormLabel>
                                <Select placeholder="Select purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                                    <option value="Consultation">Medical Consultation</option>
                                    <option value="Vaccination">Vaccination</option>
                                    <option value="Pharmacy">Medicine Pickup</option>
                                    <option value="Laboratory">Lab Test</option>
                                    <option value="Inquiry">General Inquiry</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onModalClose}>Cancel</Button>
                        <Button colorScheme="teal" leftIcon={<FiCheckCircle />} onClick={handleLogEntry}>Log Entry</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default SecurityDashboard;
