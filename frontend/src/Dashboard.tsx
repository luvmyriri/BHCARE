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
} from '@chakra-ui/react';
import {
    FiHome,
    FiCalendar,
    FiUser,
    FiLogOut,
    FiActivity,
    FiFileText,
} from 'react-icons/fi';
import Profile from './Profile';
import Appointments from './Appointments';
import AIChatbot from './AIChatbot';

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

const StatCard = ({ label, value, icon, color }: any) => (
    <Box
        bg="white"
        p={6}
        borderRadius="2xl"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.100"
        flex="1"
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
                <Text fontSize="sm" fontWeight="600" opacity={0.8}>BHCare Patient Portal</Text>
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

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');

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

                        <Flex gap={6} flexWrap="wrap">
                            <StatCard label="Upcoming Appointments" value="1" icon={FiCalendar} color="teal" />
                            <StatCard label="Health Records" value="12" icon={FiFileText} color="orange" />
                            <StatCard label="Health Score" value="98%" icon={FiActivity} color="green" />
                        </Flex>

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
                    <VStack align="stretch">
                        <PageHero
                            badge="HEALTH RECORDS"
                            title="Medical Logs & Results"
                            description="Access your past check-ups, diagnostic reports, and medical history in one secure place."
                        />
                        <Flex h="300px" align="center" justify="center" bg="white" borderRadius="2xl" border="1px dashed" borderColor="gray.200">
                            <Text color="gray.400">Records Archives Integration in Progress</Text>
                        </Flex>
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
                        <Text color="gray.400" fontSize="sm">
                            Healthcare Dashboard v4.0
                        </Text>
                    </VStack>
                    <HStack spacing={4}>
                        <VStack align="end" spacing={0} mr={2}>
                            <Text fontWeight="700" color="teal.800" fontSize="sm">
                                {user?.first_name} {user?.last_name}
                            </Text>
                            <Text color="gray.500" fontSize="xs" fontWeight="500">
                                Patient ID: #{user?.id?.toString().padStart(4, '0')}
                            </Text>
                        </VStack>
                        <Avatar size="md" name={`${user?.first_name} ${user?.last_name}`} bg="teal.500" color="white" border="2px solid white" boxShadow="md" />
                    </HStack>
                </Flex>

                <Box>
                    {renderContent()}
                </Box>
            </Box>

            {/* AI Chatbot */}
            <AIChatbot />
        </Box>
    );
};

export default Dashboard;
