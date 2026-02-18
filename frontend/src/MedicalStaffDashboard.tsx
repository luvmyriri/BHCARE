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
    useToast,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react';
import {
    FiList,
    FiLogOut,
    FiMenu,
    FiCheckCircle,
    FiMic,
    FiSearch,
    FiActivity,
} from 'react-icons/fi';

interface MedicalStaffDashboardProps {
    user: any;
    onLogout: () => void;
}

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
            <Text fontSize={{ base: "sm", md: "lg" }} opacity={0.9} maxW="container.md">
                {description}
            </Text>
        </Box>
        <Icon
            as={FiActivity}
            position="absolute"
            right="-20px"
            bottom="-40px"
            boxSize="200px"
            opacity={0.1}
            transform="rotate(-15deg)"
        />
        <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.100"
            zIndex={0}
        />
    </Box>
);

const MedicalStaffDashboard: React.FC<MedicalStaffDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('queue');
    const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
    const [queue, setQueue] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    // Polling for queue updates
    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        try {
            const response = await fetch('/api/queue');
            if (response.ok) {
                const data = await response.json();
                setQueue(data);
            }
        } catch (error) {
            console.error('Error fetching queue:', error);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const response = await fetch(`/api/appointments/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                toast({
                    title: `Status Updated`,
                    description: `Patient marked as ${status}`,
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                fetchQueue();
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to update status',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredQueue = queue.filter(item =>
        item.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.first_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <Flex h="100vh" bg="gray.50" overflow="hidden">
            {/* Sidebar for Desktop */}
            <Box
                w="280px"
                bg="white"
                borderRight="1px solid"
                borderColor="gray.100"
                py={8}
                display={{ base: 'none', md: 'block' }}
                position="relative"
                h="full"
                zIndex={10}
            >
                <Flex align="center" px={8} mb={10}>
                    <HStack spacing={3}>
                        <img src="/images/Logo.png" alt="Logo" style={{ height: '32px' }} />
                        <Text fontSize="xl" fontWeight="800" color="teal.800" letterSpacing="tight">
                            BHCare <Text as="span" color="orange.500" fontSize="xs">STAFF</Text>
                        </Text>
                    </HStack>
                </Flex>

                <VStack spacing={2} align="stretch" px={4}>
                    <NavItem icon={FiList} active={activeTab === 'queue'} onClick={() => setActiveTab('queue')}>
                        Queue Management
                    </NavItem>
                </VStack>

                <Box pos="absolute" bottom="8" w="full" px={4}>
                    <Divider mb={4} />
                    <NavItem icon={FiLogOut} onClick={onLogout}>
                        Exit Station
                    </NavItem>
                </Box>
            </Box>

            {/* Mobile Sidebar */}
            <Drawer isOpen={isSidebarOpen} placement="left" onClose={onSidebarClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerBody p={0}>
                        <Box h="full" bg="white" py={8}>
                            <Flex align="center" px={8} mb={10}>
                                <HStack spacing={3}>
                                    <img src="/images/Logo.png" alt="Logo" style={{ height: '32px' }} />
                                    <Text fontSize="xl" fontWeight="800" color="teal.800" letterSpacing="tight">
                                        BHCare <Text as="span" color="orange.500" fontSize="xs">STAFF</Text>
                                    </Text>
                                </HStack>
                            </Flex>
                            <VStack spacing={2} align="stretch" px={4}>
                                <NavItem icon={FiList} active={activeTab === 'queue'} onClick={() => { setActiveTab('queue'); onSidebarClose(); }}>
                                    Queue Management
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

            {/* Main Content */}
            <Box flex="1" overflowY="auto" p={{ base: 4, md: 8 }}>
                <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    onClick={onSidebarOpen}
                    variant="outline"
                    aria-label="open menu"
                    icon={<FiMenu />}
                    mb={4}
                />

                {activeTab === 'queue' && (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge="QUEUE MANAGEMENT"
                            title="Daily Patient Queue"
                            description="Monitor and manage patient flow, status, and service assignments in real-time."
                        />
                        <Box bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
                                <Heading size="md" color="teal.800">Today's Queue</Heading>
                                <HStack>
                                    <Button size="sm" onClick={fetchQueue} leftIcon={<FiSearch />}>Refresh</Button>
                                    <InputGroup w="300px">
                                        <InputLeftElement pointerEvents="none"><FiSearch color="gray.300" /></InputLeftElement>
                                        <Input
                                            placeholder="Search patient..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </InputGroup>
                                </HStack>
                            </Flex>

                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Time</Th>
                                            <Th>Patient Name</Th>
                                            <Th>Service</Th>
                                            <Th>Status</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filteredQueue.length > 0 ? (
                                            filteredQueue.map((item) => (
                                                <Tr key={item.id} bg={item.status === 'serving' ? 'green.50' : 'white'}>
                                                    <Td fontWeight="bold">{item.appointment_time}</Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="600">{item.first_name} {item.last_name}</Text>
                                                            <Text fontSize="xs" color="gray.500">{item.gender}</Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme="blue" borderRadius="full" px={2}>{item.service_type}</Badge>
                                                    </Td>
                                                    <Td>
                                                        <Badge
                                                            colorScheme={
                                                                item.status === 'serving' ? 'green' :
                                                                    item.status === 'confirmed' ? 'blue' : 'gray'
                                                            }
                                                        >
                                                            {item.status.toUpperCase()}
                                                        </Badge>
                                                    </Td>
                                                    <Td>
                                                        <HStack spacing={2}>
                                                            {item.status !== 'serving' && (
                                                                <Button
                                                                    size="xs"
                                                                    colorScheme="green"
                                                                    leftIcon={<FiMic />}
                                                                    onClick={() => handleUpdateStatus(item.id, 'serving')}
                                                                >
                                                                    Call
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="xs"
                                                                colorScheme="blue"
                                                                variant="outline"
                                                                leftIcon={<FiCheckCircle />}
                                                                onClick={() => handleUpdateStatus(item.id, 'completed')}
                                                            >
                                                                Finish
                                                            </Button>
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                                                    No patients in queue for today.
                                                </Td>
                                            </Tr>
                                        )}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Box>
                    </VStack>
                )}
            </Box>
        </Flex>
    );
};

export default MedicalStaffDashboard;
