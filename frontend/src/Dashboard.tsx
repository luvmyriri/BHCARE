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
    Badge,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Progress,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    IconButton,
    SimpleGrid,
} from '@chakra-ui/react';
import {
    FiHome,
    FiCalendar,
    FiUser,
    FiLogOut,
    FiActivity,
    FiFileText,
    FiMenu,
} from 'react-icons/fi';
import Profile from './Profile';
import Appointments from './Appointments';
import AIChatbot from './AIChatbot';
import HealthCalculators from './components/HealthCalculators';

interface DashboardProps {
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

const StatCard = ({ label, value, icon, color, onClick }: any) => (
    <Box
        bg="white"
        p={{ base: 4, md: 6 }}
        borderRadius="2xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
        flex="1"
        cursor={onClick ? "pointer" : "default"}
        onClick={onClick}
        transition="all 0.2s"
        _hover={onClick ? { transform: "translateY(-2px)", boxShadow: "md" } : {}}
    >
        <Flex align="center" justify="space-between">
            <VStack align="start" spacing={1}>
                <Text color="gray.500" fontSize="sm" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
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
        mb={{ base: 6, md: 8 }}
    >
        <Box position="relative" zIndex={1}>
            <HStack spacing={4} mb={2}>
                <Badge colorScheme="orange" variant="solid" px={3} borderRadius="full" fontSize={{ base: "xs", md: "sm" }}>{badge}</Badge>
                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="600" opacity={0.8}>BHCare Patient Portal</Text>
            </HStack>
            <Heading size={{ base: "lg", md: "xl" }} mb={4} lineHeight="shorter">
                {title}
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} opacity={0.9} maxW="lg">
                {description}
            </Text>
        </Box>
        <Icon
            as={FiActivity}
            position="absolute"
            right={{ base: "-30px", md: "-20px" }}
            bottom={{ base: "-30px", md: "-20px" }}
            boxSize={{ base: "150px", md: "200px" }}
            opacity={0.15}
            transform="rotate(-15deg)"
        />
    </Box>
);

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
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
            case 'appointments':
                return (
                    <>
                        <ModalHeader>Upcoming Appointments</ModalHeader>
                        <ModalBody>
                            <Box p={4} bg="teal.50" borderRadius="lg" mb={4}>
                                <Text fontWeight="bold" color="teal.800">Next Visit: Feb 24, 2026</Text>
                                <Text fontSize="sm">Reason: Medical Check-up</Text>
                                <Text fontSize="sm">Doctor: Dr. Maria Santos</Text>
                            </Box>
                            <Button size="sm" w="full" colorScheme="teal" onClick={() => setActiveTab('appointments')}>Book New Appointment</Button>
                        </ModalBody>
                    </>
                );
            case 'records':
                return (
                    <>
                        <ModalHeader>Recent Health Records</ModalHeader>
                        <ModalBody>
                            <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between" p={2} borderBottom="1px solid" borderColor="gray.100">
                                    <Text fontSize="sm" fontWeight="600">Blood Test Results</Text>
                                    <Text fontSize="xs" color="gray.500">Feb 10, 2026</Text>
                                </HStack>
                                <HStack justify="space-between" p={2} borderBottom="1px solid" borderColor="gray.100">
                                    <Text fontSize="sm" fontWeight="600">Urinalysis</Text>
                                    <Text fontSize="xs" color="gray.500">Jan 15, 2026</Text>
                                </HStack>
                                <Button size="sm" variant="link" colorScheme="teal" onClick={() => setActiveTab('records')}>View All Records</Button>
                            </VStack>
                        </ModalBody>
                    </>
                );
            case 'health_score':
                return (
                    <>
                        <ModalHeader>Health Score Breakdown</ModalHeader>
                        <ModalBody>
                            <VStack align="stretch" spacing={4}>
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold">Body Mass Index (BMI)</Text>
                                    <Progress value={80} size="sm" colorScheme="green" />
                                    <Text fontSize="xs" mt={1}>Normal Range (22.5)</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold">Blood Pressure</Text>
                                    <Progress value={90} size="sm" colorScheme="green" />
                                    <Text fontSize="xs" mt={1}>120/80 mmHg (Good)</Text>
                                </Box>
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold">Physical Activity</Text>
                                    <Progress value={60} size="sm" colorScheme="orange" />
                                    <Text fontSize="xs" mt={1}>Moderate (Needs Improvement)</Text>
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

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <VStack align="stretch" spacing={8}>
                        <PageHero
                            badge="HEALTH OVERVIEW"
                            title={`Welcome back, ${user?.first_name || 'Patient'}! 👋`}
                            description="Your health is our priority. Manage your appointments, health records, and profile details right here."
                        />

                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
                            <StatCard label="Upcoming Appointments" value="1" icon={FiCalendar} color="teal" onClick={() => handleCardClick('appointments')} />
                            <StatCard label="Health Records" value="12" icon={FiFileText} color="orange" onClick={() => handleCardClick('records')} />
                            <StatCard label="Health Score" value="98%" icon={FiActivity} color="green" onClick={() => handleCardClick('health_score')} />
                        </SimpleGrid>

                        <Heading size="md" color="teal.800" mt={4}>
                            Recent Activity
                        </Heading>
                        <VStack align="stretch" spacing={4}>
                            <Box p={5} bg="white" borderRadius="xl" boxShadow="xs" border="1px solid" borderColor="gray.50">
                                <HStack justify="space-between">
                                    <HStack spacing={4}>
                                        <Box p={2} bg="teal.50" borderRadius="lg">
                                            <Icon as={FiCalendar} color="teal.500" />
                                        </Box>
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="700">Medical Check-up Booked</Text>
                                            <Text fontSize="sm" color="gray.500">Scheduled for Feb 24, 2026 at 10:00 AM</Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.400">2 hours ago</Text>
                                </HStack>
                            </Box>
                            <Box p={5} bg="white" borderRadius="xl" boxShadow="xs" border="1px solid" borderColor="gray.50">
                                <HStack justify="space-between">
                                    <HStack spacing={4}>
                                        <Box p={2} bg="orange.50" borderRadius="lg">
                                            <Icon as={FiUser} color="orange.500" />
                                        </Box>
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="700">Profile Updated</Text>
                                            <Text fontSize="sm" color="gray.500">Contact information changed</Text>
                                        </VStack>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.400">Yesterday</Text>
                                </HStack>
                            </Box>
                        </VStack>
                    </VStack>
                );
            case 'appointments':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge="APPOINTMENTS"
                            title="Schedule & Book Consultations"
                            description="Book new appointments or manage your existing ones with ease. Select your preferred date and time below."
                        />
                        <Appointments user={user} onClose={() => setActiveTab('overview')} />
                    </VStack>
                );
            case 'profile':
                return (
                    <VStack align="stretch">
                        <PageHero
                            badge="MY PROFILE"
                            title="Personal & Health Information"
                            description="Keep your contact details and medical preferences up to date for better healthcare delivery."
                        />
                        <Profile user={user} onClose={() => setActiveTab('overview')} onUpdated={() => { }} />
                    </VStack>
                );
            case 'records':
                return (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge="HEALTH RECORDS"
                            title="Medical Logs & Results"
                            description="Access your past check-ups, diagnostic reports, and medical history in one secure place."
                        />

                        <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
                            <Box flex="2" bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <Heading size="md" color="teal.800" mb={6}>My Medical History</Heading>
                                <Box overflowX="auto">
                                    <Table variant="simple">
                                        <Thead>
                                            <Tr>
                                                <Th>Date</Th>
                                                <Th>Diagnosis / Procedure</Th>
                                                <Th>Doctor</Th>
                                                <Th>Status</Th>
                                                <Th>Action</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {[
                                                { date: 'Feb 10, 2026', diag: 'Annual Physical Exam', doc: 'Dr. Santos', status: 'Completed' },
                                                { date: 'Jan 15, 2026', diag: 'Flu Vaccination', doc: 'Dr. Gomez', status: 'Completed' },
                                                { date: 'Dec 05, 2025', diag: 'Dental Cleaning', doc: 'Dr. Reyes', status: 'Completed' },
                                            ].map((r, i) => (
                                                <Tr key={i}>
                                                    <Td>{r.date}</Td>
                                                    <Td fontWeight="600">{r.diag}</Td>
                                                    <Td>{r.doc}</Td>
                                                    <Td><Badge colorScheme="green">{r.status}</Badge></Td>
                                                    <Td>
                                                        <Button size="xs" colorScheme="teal" variant="ghost">View Result</Button>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            </Box>

                            <Box flex="1" bg="teal.50" p={6} borderRadius="2xl" border="1px solid" borderColor="teal.100">
                                <VStack align="start" spacing={4}>
                                    <Heading size="md" color="teal.800">Request Documents</Heading>
                                    <Text fontSize="sm" color="teal.700">
                                        Need a medical certificate or health clearance? Request it here and pick it up at the center.
                                    </Text>
                                    <Divider borderColor="teal.200" />
                                    <Button w="full" colorScheme="teal" size="md">
                                        Request Medical Certificate
                                    </Button>
                                    <Button w="full" colorScheme="orange" variant="outline" size="md">
                                        Request Health Clearance
                                    </Button>
                                    <Text fontSize="xs" color="gray.500" mt={2}>
                                        *Processing time: 1-2 working days. You will be notified when it's ready.
                                    </Text>
                                </VStack>
                            </Box>
                        </Flex>
                    </VStack>
                );
            case 'health-tools':
                return (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge="HEALTH TOOLS"
                            title="Interactive Health Calculators"
                            description="Monitor your health metrics with our handy tools. Staying informed is the first step to a healthier life."
                        />
                        <HealthCalculators />
                    </VStack>
                );
            default:
                return null;
        }
    };

    return (
        <Box minH="100vh" bg="#f7fafc">
            {/* Sidebar */}
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
                <Flex h="20" align="center" mx="8" mb={8}>
                    <HStack spacing={3}>
                        <img src="/images/Logo.png" alt="Logo" style={{ height: '32px' }} />
                        <Text fontSize="xl" fontWeight="800" color="teal.800" letterSpacing="tight">
                            BHCare
                        </Text>
                    </HStack>
                </Flex>

                <VStack spacing={2} align="stretch" px={4}>
                    <NavItem icon={FiHome} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                        Overview
                    </NavItem>
                    <NavItem icon={FiCalendar} active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
                        Appointments
                    </NavItem>
                    <NavItem icon={FiFileText} active={activeTab === 'records'} onClick={() => setActiveTab('records')}>
                        Health Records
                    </NavItem>
                    <NavItem icon={FiUser} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                        Profile Setting
                    </NavItem>
                    <NavItem icon={FiActivity} active={activeTab === 'health-tools'} onClick={() => setActiveTab('health-tools')}>
                        Health Tools
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
            <Box ml={{ base: 0, md: '280px' }} p={{ base: 4, sm: 6, md: 8 }} position="relative">
                <Flex 
                    justify="space-between" 
                    align={{ base: "start", sm: "center" }} 
                    mb={{ base: 6, md: 10 }}
                    direction={{ base: "column", sm: "row" }}
                    gap={4}
                >
                    <HStack spacing={4} w="full">
                        <IconButton
                            display={{ base: 'flex', md: 'none' }}
                            onClick={onSidebarOpen}
                            variant="outline"
                            aria-label="open menu"
                            icon={<FiMenu />}
                            size="md"
                        />
                        <VStack align="start" spacing={0}>
                            <Heading size={{ base: "sm", md: "md" }} color="teal.800" textTransform="capitalize">
                                {activeTab.replace('-', ' ')}
                            </Heading>
                            <Text color="gray.400" fontSize={{ base: "xs", md: "sm" }}>
                                Healthcare Dashboard v4.0
                            </Text>
                        </VStack>
                    </HStack>
                    <HStack spacing={3} align={{ base: "start", sm: "center" }} pl={{ base: 12, sm: 0 }} maxW={{ base: "calc(100% - 60px)", sm: "auto" }}>
                        <VStack align="end" spacing={0} mr={2} overflow="hidden">
                            <Text 
                                fontWeight="700" 
                                color="teal.800" 
                                fontSize={{ base: "sm", md: "md" }} 
                                isTruncated
                                maxW="full"
                            >
                                {user?.first_name} {user?.last_name}
                            </Text>
                            <Badge colorScheme="teal" variant="subtle" fontSize="10px" borderRadius="full" px={2}>
                                Patient
                            </Badge>
                        </VStack>
                        <Avatar size={{ base: "sm", md: "md" }} name={`${user?.first_name} ${user?.last_name}`} bg="teal.500" color="white" border="2px solid white" boxShadow="md" flexShrink={0} />
                    </HStack>
                </Flex>

                <Box>
                    {renderContent()}
                </Box>
            </Box>

            {/* AI Chatbot */}
            <AIChatbot />

            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedCard && selectedCard.replace('_', ' ').charAt(0).toUpperCase() + selectedCard.replace('_', ' ').slice(1)} Details</ModalHeader>
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
                                        BHCare
                                    </Text>
                                </HStack>
                            </Flex>

                            <VStack spacing={2} align="stretch" px={4}>
                                <NavItem icon={FiHome} active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); onSidebarClose(); }}>
                                    Overview
                                </NavItem>
                                <NavItem icon={FiCalendar} active={activeTab === 'appointments'} onClick={() => { setActiveTab('appointments'); onSidebarClose(); }}>
                                    Appointments
                                </NavItem>
                                <NavItem icon={FiFileText} active={activeTab === 'records'} onClick={() => { setActiveTab('records'); onSidebarClose(); }}>
                                    Health Records
                                </NavItem>
                                <NavItem icon={FiUser} active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); onSidebarClose(); }}>
                                    Profile Setting
                                </NavItem>
                                <NavItem icon={FiActivity} active={activeTab === 'health-tools'} onClick={() => { setActiveTab('health-tools'); onSidebarClose(); }}>
                                    Health Tools
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

export default Dashboard;
