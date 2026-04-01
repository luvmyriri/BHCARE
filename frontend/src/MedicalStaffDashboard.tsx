import React, { useState, useEffect } from 'react';
import AppointmentCalendar from './components/AppointmentCalendar';
import { formatSystemTime } from './utils/dateFormatter';
import {
    Box,
    Flex,
    VStack,
    Icon,
    Text,
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
    useOutsideClick,
} from '@chakra-ui/react';
import {
    FiList,
    FiLogOut,
    FiMenu,
    FiCheckCircle,
    FiMic,
    FiSearch,
    FiActivity,
    FiUserPlus,
    FiCalendar,
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

// PSGC Interfaces
interface PSGCRegion { code: string; name: string; }
interface PSGCProvince { code: string; name: string; }
interface PSGCCity { code: string; name: string; }
interface PSGCBarangay { code: string; name: string; }

const MedicalStaffDashboard: React.FC<MedicalStaffDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('queue');
    const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
    const [queue, setQueue] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    // Walk-in Registration State
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [contact, setContact] = useState('+63');

    // Address State
    const [regions, setRegions] = useState<PSGCRegion[]>([]);
    const [provinces, setProvinces] = useState<PSGCProvince[]>([]);
    const [cities, setCities] = useState<PSGCCity[]>([]);
    const [barangays, setBarangayList] = useState<PSGCBarangay[]>([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [streetName, setStreetName] = useState('');

    const [isRegistering, setIsRegistering] = useState(false);
    const [isPwd, setIsPwd] = useState(false);

    // Form states for Appointment
    const [appointmentUserId, setAppointmentUserId] = useState<number | ''>('');
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const patientDropdownRef = React.useRef<HTMLDivElement>(null);
    const [appointmentService, setAppointmentService] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [isBooking, setIsBooking] = useState(false);

    useOutsideClick({
        ref: patientDropdownRef,
        handler: () => setShowPatientDropdown(false),
    });

    useEffect(() => {
        if (appointmentUserId) {
            const p = patients.find(p => p.id === appointmentUserId);
            if (p) setPatientSearchQuery(`${p.last_name}, ${p.first_name} (${p.p_id})`);
        } else {
            setPatientSearchQuery('');
        }
    }, [appointmentUserId, patients]);

    const filteredPatients = patients.filter(p =>
        `${p.last_name}, ${p.first_name} (${p.p_id})`.toLowerCase().includes(patientSearchQuery.toLowerCase())
    );

    // Fetch Base Data
    useEffect(() => {
        fetchQueue();
        fetchServices();
        fetchPatients();
        const interval = setInterval(fetchQueue, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // PSGC Initial Load
    useEffect(() => {
        fetch('https://psgc.cloud/api/regions')
            .then(res => res.json())
            .then(data => setRegions(data))
            .catch(err => console.error('Failed to load regions', err));
    }, []);

    useEffect(() => {
        if (!selectedRegion) {
            setProvinces([]); setSelectedProvince('');
            setCities([]); setSelectedCity('');
            setBarangayList([]); setBarangay(''); return;
        }
        if (selectedRegion === '1300000000') {
            setProvinces([]); setSelectedProvince(''); setProvince('Metro Manila');
            fetch(`https://psgc.cloud/api/regions/${selectedRegion}/cities-municipalities`)
                .then(res => res.json())
                .then(data => setCities(data));
        } else {
            fetch(`https://psgc.cloud/api/regions/${selectedRegion}/provinces`)
                .then(res => res.json())
                .then(data => setProvinces(data));
        }
    }, [selectedRegion]);

    useEffect(() => {
        if (selectedRegion !== '1300000000') {
            if (!selectedProvince) {
                setCities([]); setSelectedCity('');
                setBarangayList([]); setBarangay(''); return;
            }
            fetch(`https://psgc.cloud/api/provinces/${selectedProvince}/cities-municipalities`)
                .then(res => res.json())
                .then(data => setCities(data));
        }
    }, [selectedProvince, selectedRegion]);

    useEffect(() => {
        if (!selectedCity) {
            setBarangayList([]); setBarangay(''); return;
        }
        fetch(`https://psgc.cloud/api/cities-municipalities/${selectedCity}/barangays`)
            .then(res => res.json())
            .then(data => setBarangayList(data));
    }, [selectedCity]);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services');
            if (res.ok) setServices(await res.json());
        } catch (e) { console.error('Error fetching services:', e); }
    };

    const fetchPatients = async () => {
        try {
            const res = await fetch('/api/doctor/patients');
            if (res.ok) setPatients(await res.json());
        } catch (e) { console.error('Error fetching patients:', e); }
    };

    const fetchAvailableSlots = async (date: string, serviceType: string) => {
        if (!date) return;
        try {
            const res = await fetch(`/api/available-slots?date=${date}&service_type=${encodeURIComponent(serviceType)}`);
            if (res.ok) setAvailableSlots(await res.json());
        } catch (e) { console.error('Error fetching slots:', e); }
    };

    const handleWalkinRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalProvince = selectedRegion === '1300000000' ? 'Metro Manila' : province;
        if (!firstName || !lastName || !email || !dob || !gender || !contact || !barangay || !city || !finalProvince) {
            toast({ title: 'Validation Error', description: 'Please fill out all required fields marked with *', status: 'warning' });
            return;
        }

        const phPhoneRegex = /^(\+639\d{9}|09\d{9})$/;
        if (!phPhoneRegex.test(contact)) {
            toast({ title: 'Validation Error', description: 'Please enter a valid Philippine mobile number (e.g., +639123456789 or 09123456789).', status: 'warning' });
            return;
        }

        const dobObj = new Date(dob);
        const maxAgeDate = new Date();
        maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 120);
        if (dobObj < maxAgeDate) {
            toast({ title: 'Validation Error', description: 'Patient cannot be older than 120 years.', status: 'warning' });
            return;
        }

        const emailRegex = /^[^\s@]+@gmail\.com$/i;
        if (!emailRegex.test(email)) {
            toast({ title: 'Validation Error', description: 'Please enter a valid @gmail.com email address.', status: 'warning' });
            return;
        }

        setIsRegistering(true);
        try {
            const payload = {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email,
                date_of_birth: dob,
                gender,
                contact_number: contact,
                barangay,
                city,
                province: finalProvince,
                house_number: houseNumber,
                street_name: streetName,
                is_pwd: isPwd
            };

            const res = await fetch('/api/register-walkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                toast({ title: 'Success', description: 'Walk-in registered. You can now book their appointment.', status: 'success' });

                // Clear form
                setFirstName(''); setMiddleName(''); setLastName(''); setEmail(''); setDob(''); setGender(''); setContact('+63');
                setBarangay(''); setCity(''); setProvince(''); setHouseNumber(''); setStreetName('');
                setIsPwd(false);

                // Refresh patients list so they appear in dropdown
                await fetchPatients();

                // Switch to appointment tab and set the new ID
                setAppointmentUserId(data.user_id);
                setActiveTab('walkin-appointment');
            } else {
                toast({ title: 'Error', description: data.error || 'Failed to register', status: 'error' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Network error', status: 'error' });
        } finally {
            setIsRegistering(false);
        }
    };

    const handleWalkinAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointmentUserId || !appointmentService || !appointmentDate || !appointmentTime) {
            toast({ title: 'Validation Error', description: 'Please fill all fields', status: 'warning' });
            return;
        }

        setIsBooking(true);
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: appointmentUserId,
                    service_type: appointmentService,
                    appointment_date: appointmentDate,
                    appointment_time: appointmentTime,
                    doctor_preference: 'Any Available Doctor',
                    reason: 'Walk-in Consultation'
                })
            });

            if (res.ok) {
                toast({ title: 'Success', description: 'Appointment booked successfully.', status: 'success' });
                setAppointmentUserId(''); setAppointmentService(''); setAppointmentDate(''); setAppointmentTime('');
                setActiveTab('queue');
                fetchQueue();
            } else {
                const data = await res.json();
                toast({ title: 'Error', description: data.error || 'Booking failed', status: 'error' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Network error', status: 'error' });
        } finally {
            setIsBooking(false);
        }
    };

    // Keep existing polling hook below but remove duplicate fetchQueue inside it

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
                    <NavItem icon={FiUserPlus} active={activeTab === 'walkin-register'} onClick={() => setActiveTab('walkin-register')}>
                        Walk-in Registration
                    </NavItem>
                    <NavItem icon={FiCalendar} active={activeTab === 'walkin-appointment'} onClick={() => setActiveTab('walkin-appointment')}>
                        Walk-in Appointment
                    </NavItem>
                </VStack>

                <Box pos="absolute" bottom="8" w="full" px={4}>
                    <Divider mb={4} />
                    <NavItem icon={FiLogOut} onClick={onLogout}>
                        Log out
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
                                <NavItem icon={FiUserPlus} active={activeTab === 'walkin-register'} onClick={() => { setActiveTab('walkin-register'); onSidebarClose(); }}>
                                    Walk-in Registration
                                </NavItem>
                                <NavItem icon={FiCalendar} active={activeTab === 'walkin-appointment'} onClick={() => { setActiveTab('walkin-appointment'); onSidebarClose(); }}>
                                    Walk-in Appointment
                                </NavItem>
                            </VStack>
                            <Box pos="absolute" bottom="8" w="full" px={4}>
                                <Divider mb={4} />
                                <NavItem icon={FiLogOut} onClick={onLogout}>
                                    Log out
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
                                                    <Td fontWeight="bold">{formatSystemTime(item.appointment_time)}</Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="600">{item.first_name} {item.last_name}</Text>
                                                            <HStack spacing={2}>
                                                                <Text fontSize="xs" color="gray.500">{item.gender}</Text>
                                                                {item.is_pregnant && (
                                                                    <Badge colorScheme="pink" variant="subtle" fontSize="0.65em" borderRadius="full">
                                                                        Priority {item.pregnancy_weeks ? `(${item.pregnancy_weeks} Weeks)` : ''}
                                                                    </Badge>
                                                                )}
                                                            </HStack>
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

                {activeTab === 'walkin-register' && (
                    <VStack align="stretch" spacing={6}>
                        <PageHero
                            badge="REGISTRATION"
                            title="Register Walk-in Patient"
                            description="Create a medical record for a new patient who walked into the clinic."
                        />
                        <Box bg="white" p={{ base: 4, md: 8 }} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                            <form onSubmit={handleWalkinRegister}>
                                <VStack spacing={6} align="stretch" w="full">
                                    <Heading size="md" color="teal.800">Personal Information</Heading>
                                    <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="600" mb={2}>First Name *</Text>
                                            <Input required placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                        </Box>
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Middle Name</Text>
                                            <Input placeholder="Middle Name" value={middleName} onChange={e => setMiddleName(e.target.value)} />
                                        </Box>
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Last Name *</Text>
                                            <Input required placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                                        </Box>
                                    </Flex>
                                    <Flex gap={4} direction={{ base: 'column', lg: 'row' }} align="flex-start">
                                        <Box flex={1} w="full">
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Date of Birth *</Text>
                                            <Input
                                                required
                                                type="date"
                                                min={(() => {
                                                    const d = new Date();
                                                    d.setFullYear(d.getFullYear() - 120);
                                                    return d.toISOString().split('T')[0];
                                                })()}
                                                max={new Date().toISOString().split('T')[0]}
                                                value={dob}
                                                onChange={e => setDob(e.target.value)}
                                            />
                                            {/* Senior Citizen Auto-Indicator */}
                                            {dob && (() => {
                                                const dobObj = new Date(dob);
                                                const today = new Date();
                                                const age = today.getFullYear() - dobObj.getFullYear() -
                                                    ((today.getMonth() < dobObj.getMonth() || (today.getMonth() === dobObj.getMonth() && today.getDate() < dobObj.getDate())) ? 1 : 0);
                                                return age >= 60 ? (
                                                    <div style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                        background: '#fffbeb', border: '1.5px solid #f6ad55',
                                                        borderRadius: '20px', padding: '4px 12px',
                                                        fontSize: '12px', fontWeight: 700, color: '#c05621', marginTop: '6px'
                                                    }}>
                                                        Senior Citizen (60+) — Priority Flag Applied
                                                    </div>
                                                ) : null;
                                            })()}
                                        </Box>
                                        <Box flex={1} w="full">
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Gender *</Text>
                                            <Box as="select" required value={gender} onChange={e => setGender(e.target.value)} w="full" h="40px" borderRadius="md" border="1px solid" borderColor="gray.200" px={3}>
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </Box>
                                        </Box>
                                        <Box flex={1.5} w="full">
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Email Address *</Text>
                                            <Input required type="email" placeholder="patient@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                                            <Text fontSize="xs" color="gray.500" mt={1}>Patient receives temporary password here to access the portal.</Text>
                                        </Box>
                                        <Box flex={1} w="full">
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Contact No. *</Text>
                                            <Input required type="tel" maxLength={13} placeholder="+639XXXXXXXXX or 09XXXXXXXXX" value={contact} onChange={e => {
                                                const val = e.target.value.replace(/[^\d+]/g, '');
                                                setContact(val);
                                            }} />
                                        </Box>
                                    </Flex>

                                    <Divider />
                                    <Heading size="md" color="teal.800">Address Information</Heading>
                                    <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
                                        <Box flex={1} w="full">
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Region *</Text>
                                            <Box as="select" required value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)} w="full" h="40px" borderRadius="md" border="1px solid" borderColor="gray.200" px={3}>
                                                <option value="">Select Region</option>
                                                <option value="1300000000">NCR - National Capital Region</option>
                                                {regions.filter(r => r.code !== '1300000000').map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                                            </Box>
                                        </Box>
                                        <Box flex={1} w="full">
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Province *</Text>
                                            <Box as="select" required={selectedRegion !== '1300000000'} disabled={!provinces.length && selectedRegion !== '1300000000'} value={selectedProvince} onChange={e => { setSelectedProvince(e.target.value); setProvince(e.target.options[e.target.selectedIndex].text); }} w="full" h="40px" borderRadius="md" border="1px solid" borderColor="gray.200" px={3}>
                                                <option value="">{selectedRegion === '1300000000' ? 'Metro Manila' : 'Select Province'}</option>
                                                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                            </Box>
                                        </Box>
                                        <Box flex={1} w="full">
                                            <Text fontSize="sm" fontWeight="600" mb={2}>City *</Text>
                                            <Box as="select" required disabled={!cities.length} value={selectedCity} onChange={e => { setSelectedCity(e.target.value); setCity(e.target.options[e.target.selectedIndex].text); }} w="full" h="40px" borderRadius="md" border="1px solid" borderColor="gray.200" px={3}>
                                                <option value="">Select City</option>
                                                {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                            </Box>
                                        </Box>
                                        <Box flex={1} w="full">
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Barangay *</Text>
                                            <Box as="select" required disabled={!barangays.length} value={barangay} onChange={e => setBarangay(e.target.value)} w="full" h="40px" borderRadius="md" border="1px solid" borderColor="gray.200" px={3}>
                                                <option value="">Select Barangay</option>
                                                {barangays.map(b => <option key={b.code} value={b.name}>{b.name}</option>)}
                                            </Box>
                                        </Box>
                                    </Flex>
                                    <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="600" mb={2}>House/Block/Lot</Text>
                                            <Input placeholder="House/Block/Lot No." value={houseNumber} onChange={e => setHouseNumber(e.target.value)} />
                                        </Box>
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Street Name</Text>
                                            <Input placeholder="Street Name" value={streetName} onChange={e => setStreetName(e.target.value)} />
                                        </Box>
                                    </Flex>

                                    {/* PWD Checkbox */}
                                    <div style={{
                                        marginTop: '8px',
                                        padding: '14px 18px',
                                        background: '#faf5ff',
                                        border: '1.5px solid #d6bcfa',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}>
                                        <input
                                            id="walkin-pwd-checkbox"
                                            type="checkbox"
                                            checked={isPwd}
                                            onChange={(e) => setIsPwd(e.target.checked)}
                                            style={{
                                                marginTop: '2px',
                                                width: '18px',
                                                height: '18px',
                                                accentColor: '#805ad5',
                                                flexShrink: 0,
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <label htmlFor="walkin-pwd-checkbox" style={{ cursor: 'pointer', lineHeight: '1.5', fontSize: '14px', color: '#4a5568' }}>
                                            Patient is a{' '}
                                            <strong style={{ color: '#805ad5' }}>Person with Disability (PWD)</strong>

                                        </label>
                                    </div>

                                    <Button
                                        type="submit"
                                        colorScheme="teal"
                                        size="lg"
                                        mt={4}
                                        isLoading={isRegistering}
                                        loadingText="Registering..."
                                        alignSelf="flex-start"
                                        px={12}
                                    >
                                        Register Patient
                                    </Button>
                                </VStack>
                            </form>
                        </Box>
                    </VStack>
                )}

                {
                    activeTab === 'walkin-appointment' && (
                        <VStack align="stretch" spacing={6}>
                            <PageHero
                                badge="APPOINTMENTS"
                                title="Walk-in Appointment Bookings"
                                description="Book an appointment slot for a registered patient who walked in today."
                            />
                            <Box bg="white" p={{ base: 4, md: 8 }} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <form onSubmit={handleWalkinAppointment}>
                                    <VStack spacing={6} align="stretch" w="full">
                                        <Heading size="md" color="teal.800">Booking Details</Heading>

                                        <Box>
                                            <Text fontSize="sm" fontWeight="600" mb={2}>Select Patient *</Text>
                                            <Box position="relative" ref={patientDropdownRef}>
                                                <Input
                                                    required={!appointmentUserId}
                                                    placeholder="Type to search patient..."
                                                    value={patientSearchQuery}
                                                    onChange={(e) => {
                                                        setPatientSearchQuery(e.target.value);
                                                        setShowPatientDropdown(true);
                                                        if (appointmentUserId !== '') setAppointmentUserId('');
                                                    }}
                                                    onClick={() => setShowPatientDropdown(true)}
                                                    w="full" h="40px" borderRadius="md" border="1px solid" borderColor="gray.200" px={3}
                                                    bg="white"
                                                    autoComplete="off"
                                                />
                                                {showPatientDropdown && (
                                                    <Box
                                                        position="absolute" top="100%" left={0} right={0} zIndex={10}
                                                        bg="white" boxShadow="md" border="1px solid" borderColor="gray.200" borderRadius="md" maxHeight="200px" overflowY="auto" mt={1}
                                                    >
                                                        {filteredPatients.length > 0 ? (
                                                            filteredPatients.map(p => (
                                                                <Box
                                                                    key={p.id}
                                                                    p={2} cursor="pointer"
                                                                    _hover={{ bg: 'blue.50' }}
                                                                    bg={appointmentUserId === p.id ? 'blue.100' : 'transparent'}
                                                                    onClick={() => {
                                                                        setAppointmentUserId(p.id);
                                                                        setPatientSearchQuery(`${p.last_name}, ${p.first_name} (${p.p_id})`);
                                                                        setShowPatientDropdown(false);
                                                                    }}
                                                                >
                                                                    {p.last_name}, {p.first_name} ({p.p_id})
                                                                </Box>
                                                            ))
                                                        ) : (
                                                            <Box p={3} color="gray.500" fontSize="sm">No patients found.</Box>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                            <Text fontSize="xs" color="gray.500" mt={1}>If not listed, please register them first in the Walk-in Registration tab.</Text>
                                        </Box>

                                        <Flex gap={4} direction={{ base: 'column', md: 'row' }} align="flex-end">
                                            <Box flex={2}>
                                                <Text fontSize="sm" fontWeight="600" mb={2}>Service Type *</Text>
                                                <Box as="select" required value={appointmentService} onChange={e => {
                                                    setAppointmentService(e.target.value);
                                                    fetchAvailableSlots(appointmentDate, e.target.value);
                                                }} w="full" h="40px" borderRadius="md" border="1px solid" borderColor="gray.200" px={3}>
                                                    <option value="">-- Choose Service --</option>
                                                    {services.map(s => (
                                                        <option key={s.id} value={s.name}>{s.name}</option>
                                                    ))}
                                                </Box>
                                            </Box>

                                            <Box flex={1}>
                                                <Text fontSize="sm" fontWeight="600" mb={2}>Date *</Text>
                                                {(() => {
                                                    const scheduleMap: Record<string, { days: number[]; hint: string }> = {
                                                        'consultation': { days: [1, 2, 3, 4, 5], hint: 'Monday to Friday' },
                                                        'prenatal': { days: [2, 4], hint: 'Tuesday & Thursday' },
                                                        'vaccination': { days: [3, 5], hint: 'Wednesday & Friday' },
                                                        'bakuna': { days: [3, 5], hint: 'Wednesday & Friday' },
                                                        'dental': { days: [1, 3, 5], hint: 'Monday, Wednesday & Friday' },
                                                        'family planning': { days: [1, 2, 3, 4, 5], hint: 'Monday to Friday' },
                                                        'dots': { days: [1, 2, 3, 4, 5], hint: 'Monday to Friday' },
                                                        'cervical': { days: [1], hint: 'Monday only' },
                                                        'nutrition': { days: [1, 2, 3, 4, 5], hint: 'Monday to Friday' },
                                                    };
                                                    const key = Object.keys(scheduleMap).find(k => appointmentService.toLowerCase().includes(k));
                                                    const rule = key ? scheduleMap[key] : null;
                                                    return (
                                                        <AppointmentCalendar
                                                            value={appointmentDate}
                                                            onChange={(date) => {
                                                                setAppointmentDate(date);
                                                                setAppointmentTime('');
                                                                if (date) fetchAvailableSlots(date, appointmentService);
                                                                else setAvailableSlots([]);
                                                            }}
                                                            allowedDays={rule?.days}
                                                            scheduleHint={rule?.hint}
                                                            minDate={new Date().toISOString().split('T')[0]}
                                                            maxDate={(() => {
                                                                const d = new Date();
                                                                d.setDate(d.getDate() + 14);
                                                                return d.toISOString().split('T')[0];
                                                            })()}
                                                        />
                                                    );
                                                })()}
                                            </Box>

                                            <Box flex={1}>
                                                <Text fontSize="sm" fontWeight="600" mb={2}>Time Slot *</Text>
                                                <Box as="select" required value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} disabled={!appointmentDate || !appointmentService || availableSlots.length === 0} w="full" h="40px" borderRadius="md" border="1px solid" borderColor="gray.200" px={3}>
                                                    <option value="">
                                                        {!appointmentDate ? "Select a date first" :
                                                            !appointmentService ? "Select a service first" :
                                                                availableSlots.length === 0 ? "No slots available" :
                                                                    "-- Select Time Slot --"}
                                                    </option>
                                                    {availableSlots.map((slot, index) => (
                                                        <option key={index} value={slot.time}>{slot.display}</option>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Flex>

                                        <Button
                                            type="submit"
                                            colorScheme="blue"
                                            size="lg"
                                            mt={4}
                                            isLoading={isBooking}
                                            loadingText="Booking..."
                                            alignSelf="flex-start"
                                            px={12}
                                        >
                                            Book Appointment
                                        </Button>
                                    </VStack>
                                </form>
                            </Box>
                        </VStack>
                    )
                }
            </Box>
        </Flex>
    );
};

export default MedicalStaffDashboard;
