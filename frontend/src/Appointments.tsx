import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Button,
    SimpleGrid,
    Textarea,
    Badge,
    Icon,
    Flex,
    Divider,
    useToast,
    IconButton,
    Grid,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiCheckCircle, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';

interface Service {
    id: number;
    name: string;
    description: string;
    duration_minutes: number;
}

interface TimeSlot {
    time: string;
    display: string;
    available: boolean;
}

interface Appointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    service_type: string;
    status: string;
    service_description?: string;
}

interface AppointmentsProps {
    user: any;
    onClose: () => void;
    isOpen: boolean;
    initialView?: 'book' | 'my-appointments';
}

const Appointments: React.FC<AppointmentsProps> = ({ user, onClose, isOpen, initialView = 'book' }) => {
    const [step, setStep] = useState(1);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [reason, setReason] = useState('');
    const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
    const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'book' | 'my-appointments'>(initialView);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setStep(1); // Reset step to 1 when opening
        }
    }, [isOpen, initialView]);
    const toast = useToast();

    useEffect(() => {
        fetchServices();
        if (user) {
            fetchMyAppointments();
        }
    }, [user]);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots();
        }
    }, [selectedDate]);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
            toast({
                title: 'Error',
                description: 'Failed to load services',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const fetchAvailableSlots = async () => {
        try {
            const serviceParam = selectedService ? `&service_type=${encodeURIComponent(selectedService.name)}` : '';
            const response = await fetch(`/api/available-slots?date=${selectedDate}${serviceParam}`);
            const data = await response.json();
            setAvailableSlots(data);
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const fetchMyAppointments = async () => {
        try {
            const response = await fetch(`/api/appointments/user/${user.id}`);
            const data = await response.json();
            // Sort: active statuses (pending/waiting/confirmed) on top by nearest date,
            // then cancelled/completed at the bottom
            const activeStatuses = ['pending', 'waiting', 'confirmed'];
            const sorted = data.sort((a: Appointment, b: Appointment) => {
                const aActive = activeStatuses.includes(a.status.toLowerCase());
                const bActive = activeStatuses.includes(b.status.toLowerCase());
                // Active appointments come first
                if (aActive && !bActive) return -1;
                if (!aActive && bActive) return 1;
                // Within active: nearest date first (ascending)
                if (aActive && bActive) {
                    return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
                }
                // Within inactive: most recent first (descending)
                return new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime();
            });
            setMyAppointments(sorted);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedService || !selectedDate || !selectedTime) {
            toast({
                title: 'Incomplete Information',
                description: 'Please complete all required fields',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            // If rescheduling, cancel the old appointment first
            if (reschedulingAppointmentId) {
                await fetch(`/api/appointments/${reschedulingAppointmentId}/cancel`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: 'Rescheduled by patient' }),
                });
            }

            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    service_type: selectedService.name,
                    appointment_date: selectedDate,
                    appointment_time: selectedTime,
                    reason: reason
                })
            });

            if (response.ok) {
                toast({
                    title: reschedulingAppointmentId ? 'Rescheduled!' : 'Success!',
                    description: reschedulingAppointmentId
                        ? 'Appointment rescheduled successfully'
                        : 'Appointment booked successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                setStep(1);
                setSelectedService(null);
                setSelectedDate('');
                setSelectedTime('');
                setReason('');
                setReschedulingAppointmentId(null);
                fetchMyAppointments();
                setView('my-appointments');
            } else {
                const error = await response.json();
                toast({
                    title: 'Booking Failed',
                    description: error.error || 'Failed to book appointment',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error booking appointment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (appointmentId: number) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Cancelled by patient' }),
            });

            if (response.ok) {
                toast({
                    title: 'Cancelled',
                    description: 'Appointment cancelled successfully',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                });
                fetchMyAppointments();
            } else {
                const errorData = await response.json();
                toast({
                    title: 'Error',
                    description: errorData.error || 'Failed to cancel appointment',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error cancelling appointment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'teal';
            case 'confirmed': return 'green';
            case 'cancelled': return 'red';
            case 'completed': return 'gray';
            case 'not_complete': return 'orange';
            default: return 'gray';
        }
    };

    const isAppointmentPast = (apt: Appointment) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const aptDate = new Date(apt.appointment_date + 'T00:00:00');
        return aptDate < today;
    };

    const getDisplayStatus = (apt: Appointment) => {
        if (['pending', 'waiting'].includes(apt.status.toLowerCase()) && isAppointmentPast(apt)) {
            return 'NOT COMPLETE';
        }
        return apt.status;
    };

    const getDisplayStatusColor = (apt: Appointment) => {
        if (['pending', 'waiting'].includes(apt.status.toLowerCase()) && isAppointmentPast(apt)) {
            return 'orange';
        }
        return getStatusColor(apt.status);
    };

    const handleReschedule = (apt: Appointment) => {
        // Store the old appointment ID so we can cancel it after new booking
        setReschedulingAppointmentId(apt.id);

        // Find the service matching this appointment
        const matchingService = services.find(s => s.name === apt.service_type);
        if (matchingService) {
            setSelectedService(matchingService);
        }
        setStep(matchingService ? 2 : 1); // Go to date selection if service found, else service selection
        setSelectedDate('');
        setSelectedTime('');
        setReason('');
        setView('book');
        toast({
            title: 'Rescheduling',
            description: `Select a new date and time for ${apt.service_type}`,
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
    };

    // Calendar helper functions
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const formatDateForInput = (day: number, month: number, year: number) => {
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        return `${year}-${monthStr}-${dayStr}`;
    };

    const isDateDisabled = (day: number, month: number, year: number) => {
        const date = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) return true;

        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        if (dayOfWeek === 0 || dayOfWeek === 6) return true; // Weekends explicitly disabled for base check

        if (!selectedService) return false;

        const serviceName = selectedService.name.toLowerCase();

        // Service-specific schedule logic
        if (serviceName.includes('consultation') || serviceName.includes('check up') || serviceName.includes('nutrition')) {
            return false;
        }
        if (serviceName.includes('prenatal')) {
            // Tuesday and Thursday
            return dayOfWeek !== 2 && dayOfWeek !== 4;
        }
        if (serviceName.includes('vaccination') || serviceName.includes('bakuna')) {
            // Wednesday and Friday
            return dayOfWeek !== 3 && dayOfWeek !== 5;
        }
        if (serviceName.includes('dental')) {
            // Monday, Wednesday, Friday
            return dayOfWeek !== 1 && dayOfWeek !== 3 && dayOfWeek !== 5;
        }
        if (serviceName.includes('family planning')) {
            // Monday to Friday 1pm
            return false;
        }
        if (serviceName.includes('dots')) {
            // Monday to Friday 1pm
            return false;
        }
        if (serviceName.includes('cervical')) {
            // Monday 8am
            return dayOfWeek !== 1;
        }
        return false;
    };

    const isToday = (day: number, month: number, year: number) => {
        const date = new Date(year, month, day);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelectedDate = (day: number, month: number, year: number) => {
        if (!selectedDate) return false;
        const formatted = formatDateForInput(day, month, year);
        return formatted === selectedDate;
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDateSelect = (day: number) => {
        if (!isDateDisabled(day, currentMonth, currentYear)) {
            const formatted = formatDateForInput(day, currentMonth, currentYear);
            setSelectedDate(formatted);
            setSelectedTime('');
        }
    };

    // CalendarPicker Component with vibrant colors
    const CalendarPicker = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Generate calendar grid
        const calendarDays = [];
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push(day);
        }

        return (
            <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="xl"
                border="1px solid"
                borderColor="gray.100"
            >
                {/* Calendar Header - Vibrant Gradient */}
                <Flex
                    align="center"
                    justify="space-between"
                    px={6}
                    py={5}
                    bgGradient="linear(to-r, green.500, teal.500)"
                    position="relative"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgGradient: 'linear(to-br, rgba(255,255,255,0.2), transparent)',
                        pointerEvents: 'none'
                    }}
                >
                    <IconButton
                        aria-label="Previous month"
                        icon={<Icon as={FiChevronLeft} boxSize={5} />}
                        onClick={handlePrevMonth}
                        size="md"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.1)' }}
                        _active={{ bg: 'whiteAlpha.400' }}
                        transition="all 0.2s"
                        borderRadius="lg"
                    />
                    <VStack spacing={0}>
                        <Heading size="lg" color="white" fontWeight="700" letterSpacing="tight">
                            {monthNames[currentMonth]}
                        </Heading>
                        <Text color="whiteAlpha.900" fontSize="sm" fontWeight="600">
                            {currentYear}
                        </Text>
                    </VStack>
                    <IconButton
                        aria-label="Next month"
                        icon={<Icon as={FiChevronRight} boxSize={5} />}
                        onClick={handleNextMonth}
                        size="md"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.1)' }}
                        _active={{ bg: 'whiteAlpha.400' }}
                        transition="all 0.2s"
                        borderRadius="lg"
                    />
                </Flex>

                {/* Day Names */}
                <Grid
                    templateColumns="repeat(7, 1fr)"
                    bg="gradient-to-b from-gray-50 to-white"
                    borderBottom="2px solid"
                    borderColor="gray.100"
                    py={3}
                >
                    {dayNames.map(day => (
                        <Box key={day} textAlign="center">
                            <Text
                                fontSize="sm"
                                fontWeight="700"
                                color="gray.600"
                                textTransform="uppercase"
                                letterSpacing="wide"
                            >
                                {day}
                            </Text>
                        </Box>
                    ))}
                </Grid>

                {/* Calendar Grid */}
                <Grid templateColumns="repeat(7, 1fr)" bg="white" p={2} gap={1}>
                    {calendarDays.map((day, index) => {
                        if (day === null) {
                            return <Box key={`empty-${index}`} />;
                        }

                        const disabled = isDateDisabled(day, currentMonth, currentYear);
                        const today = isToday(day, currentMonth, currentYear);
                        const selected = isSelectedDate(day, currentMonth, currentYear);

                        return (
                            <Box
                                key={day}
                                p={1}
                                textAlign="center"
                                cursor={disabled ? 'not-allowed' : 'pointer'}
                                onClick={() => !disabled && handleDateSelect(day)}
                                opacity={disabled ? 0.3 : 1}
                            >
                                <Flex
                                    w="42px"
                                    h="42px"
                                    mx="auto"
                                    align="center"
                                    justify="center"
                                    borderRadius="xl"
                                    bg={selected
                                        ? 'linear-gradient(to right, #38A169, #319795)'
                                        : today
                                            ? 'orange.100'
                                            : 'transparent'}
                                    color={selected
                                        ? 'white'
                                        : today
                                            ? 'orange.700'
                                            : 'gray.700'}
                                    fontWeight={selected || today ? 'bold' : '600'}
                                    fontSize="sm"
                                    border={today && !selected ? '2px solid' : 'none'}
                                    borderColor="orange.400"
                                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                    boxShadow={selected ? 'lg' : 'none'}
                                    _hover={!disabled ? {
                                        transform: 'scale(1.15)',
                                        bg: selected
                                            ? 'linear-gradient(to right, #38A169, #319795)'
                                            : 'teal.50',
                                        boxShadow: 'md',
                                        zIndex: 10
                                    } : {}}
                                >
                                    {day}
                                </Flex>
                            </Box>
                        );
                    })}
                </Grid>
            </Box>
        );
    };

    // Group time slots by time of day
    const groupTimeSlots = () => {
        const morning = availableSlots.filter(slot => {
            const hour = parseInt(slot.time.split(':')[0]);
            return hour >= 8 && hour < 12;
        });
        const afternoon = availableSlots.filter(slot => {
            const hour = parseInt(slot.time.split(':')[0]);
            return hour >= 12 && hour < 17;
        });
        const evening = availableSlots.filter(slot => {
            const hour = parseInt(slot.time.split(':')[0]);
            return hour >= 17;
        });
        return { morning, afternoon, evening };
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside" isCentered>
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(12px)" />
            <ModalContent
                maxH="92vh"
                borderRadius="3xl"
                boxShadow="2xl"
                mx={4}
            >
                <ModalHeader
                    bgGradient="linear(to-r, green.500, teal.500)"
                    color="white"
                    borderTopRadius="3xl"
                    py={8}
                    px={8}
                    position="relative"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgGradient: 'linear(to-br, rgba(255,255,255,0.2), transparent)',
                        pointerEvents: 'none',
                        borderTopRadius: '3xl'
                    }}
                >
                    <HStack spacing={4}>
                        <Icon as={FiCalendar} boxSize={8} />
                        <VStack align="start" spacing={0}>
                            <Heading size="xl" fontWeight="800">Appointments</Heading>
                            <Text fontSize="sm" color="whiteAlpha.900" fontWeight="500">
                                Book and manage your healthcare appointments
                            </Text>
                        </VStack>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton
                    color="white"
                    size="lg"
                    top={6}
                    right={6}
                    _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.1)' }}
                    borderRadius="lg"
                />
                <ModalBody p={8} bg="gray.50">
                    <Box bg="white" borderRadius="2xl" p={6} boxShadow="sm">
                        {/* View Toggle */}
                        <HStack spacing={3} mb={8} bg="gray.100" p={2} borderRadius="xl">
                            <Button
                                flex={1}
                                variant={view === 'book' ? 'solid' : 'ghost'}
                                bgGradient={view === 'book' ? 'linear(to-r, green.500, teal.500)' : 'none'}
                                color={view === 'book' ? 'white' : 'gray.600'}
                                onClick={() => setView('book')}
                                fontWeight="700"
                                size="lg"
                                borderRadius="lg"
                                _hover={{
                                    transform: 'translateY(-2px)',
                                    boxShadow: view === 'book' ? 'lg' : 'none'
                                }}
                                transition="all 0.2s"
                            >
                                📅 Book Appointment
                            </Button>
                            <Button
                                flex={1}
                                variant={view === 'my-appointments' ? 'solid' : 'ghost'}
                                bgGradient={view === 'my-appointments' ? 'linear(to-r, green.500, teal.500)' : 'none'}
                                color={view === 'my-appointments' ? 'white' : 'gray.600'}
                                onClick={() => setView('my-appointments')}
                                fontWeight="700"
                                size="lg"
                                borderRadius="lg"
                                _hover={{
                                    transform: 'translateY(-2px)',
                                    boxShadow: view === 'my-appointments' ? 'lg' : 'none'
                                }}
                                transition="all 0.2s"
                            >
                                📋 My Appointments
                            </Button>
                        </HStack>

                        {view === 'book' ? (
                            <VStack align="stretch" spacing={8}>
                                {/* Step Indicator */}
                                <Flex justify="center" align="center" mb={4}>
                                    <HStack spacing={4}>
                                        <VStack spacing={2}>
                                            <Flex
                                                w="50px"
                                                h="50px"
                                                borderRadius="full"
                                                align="center"
                                                justify="center"
                                                fontWeight="bold"
                                                fontSize="lg"
                                                bgGradient={step >= 1 ? 'linear(to-r, green.500, teal.500)' : 'none'}
                                                bg={step >= 1 ? 'teal.500' : 'gray.200'}
                                                color={step >= 1 ? 'white' : 'gray.500'}
                                                boxShadow={step >= 1 ? 'lg' : 'none'}
                                                transition="all 0.3s"
                                            >
                                                1
                                            </Flex>
                                            <Text fontSize="xs" fontWeight="600" color="gray.600">Service</Text>
                                        </VStack>

                                        <Box w="80px" h="3px" bgGradient={step >= 2 ? 'linear(to-r, green.500, teal.500)' : 'none'} bg={step >= 2 ? 'teal.500' : 'gray.200'} borderRadius="full" />

                                        <VStack spacing={2}>
                                            <Flex
                                                w="50px"
                                                h="50px"
                                                borderRadius="full"
                                                align="center"
                                                justify="center"
                                                fontWeight="bold"
                                                fontSize="lg"
                                                bgGradient={step >= 2 ? 'linear(to-r, green.500, teal.500)' : 'none'}
                                                bg={step >= 2 ? 'teal.500' : 'gray.200'}
                                                color={step >= 2 ? 'white' : 'gray.500'}
                                                boxShadow={step >= 2 ? 'lg' : 'none'}
                                                transition="all 0.3s"
                                            >
                                                2
                                            </Flex>
                                            <Text fontSize="xs" fontWeight="600" color="gray.600">Date & Time</Text>
                                        </VStack>

                                        <Box w="80px" h="3px" bgGradient={step >= 3 ? 'linear(to-r, green.500, teal.500)' : 'none'} bg={step >= 3 ? 'teal.500' : 'gray.200'} borderRadius="full" />

                                        <VStack spacing={2}>
                                            <Flex
                                                w="50px"
                                                h="50px"
                                                borderRadius="full"
                                                align="center"
                                                justify="center"
                                                fontWeight="bold"
                                                fontSize="lg"
                                                bgGradient={step >= 3 ? 'linear(to-r, green.500, teal.500)' : 'none'}
                                                bg={step >= 3 ? 'teal.500' : 'gray.200'}
                                                color={step >= 3 ? 'white' : 'gray.500'}
                                                boxShadow={step >= 3 ? 'lg' : 'none'}
                                                transition="all 0.3s"
                                            >
                                                3
                                            </Flex>
                                            <Text fontSize="xs" fontWeight="600" color="gray.600">Confirm</Text>
                                        </VStack>
                                    </HStack>
                                </Flex>

                                {/* Step 1: Select Service */}
                                {step === 1 && (
                                    <VStack align="stretch" spacing={6}>
                                        <Heading size="lg" bgGradient="linear(to-r, green.600, teal.600)" bgClip="text">
                                            Select a Service
                                        </Heading>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            {services.map(service => (
                                                <Box
                                                    key={service.id}
                                                    onClick={() => setSelectedService(service)}
                                                    p={6}
                                                    borderRadius="2xl"
                                                    border="3px solid"
                                                    borderColor={selectedService?.id === service.id ? 'teal.400' : 'gray.200'}
                                                    bg={selectedService?.id === service.id ? 'teal.50' : 'white'}
                                                    cursor="pointer"
                                                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                                    _hover={{
                                                        borderColor: 'teal.400',
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: 'xl'
                                                    }}
                                                    boxShadow={selectedService?.id === service.id ? 'lg' : 'sm'}
                                                >
                                                    <HStack align="start" spacing={4}>
                                                        <Text fontSize="5xl">🏥</Text>
                                                        <VStack align="start" flex={1} spacing={2}>
                                                            <Heading size="md" color="gray.900" fontWeight="700">{service.name}</Heading>
                                                            <Text fontSize="sm" color="gray.600" lineHeight="tall">{service.description}</Text>
                                                            <Badge
                                                                colorScheme="teal"
                                                                borderRadius="full"
                                                                px={4}
                                                                py={1.5}
                                                                fontSize="xs"
                                                                fontWeight="700"
                                                            >
                                                                ⏱️ {service.duration_minutes} mins
                                                            </Badge>
                                                        </VStack>
                                                    </HStack>
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                        <Button
                                            isDisabled={!selectedService}
                                            onClick={() => setStep(2)}
                                            bgGradient="linear(to-r, green.500, teal.500)"
                                            color="white"
                                            size="lg"
                                            h="56px"
                                            fontSize="lg"
                                            fontWeight="700"
                                            borderRadius="xl"
                                            _hover={{
                                                transform: 'translateY(-2px)',
                                                boxShadow: 'xl'
                                            }}
                                            _active={{
                                                transform: 'translateY(0)'
                                            }}
                                            transition="all 0.2s"
                                        >
                                            Next Step →
                                        </Button>
                                    </VStack>
                                )}

                                {/* Step 2: Select Date & Time */}
                                {step === 2 && (
                                    <VStack align="stretch" spacing={6}>
                                        <Heading size="lg" bgGradient="linear(to-r, green.600, teal.600)" bgClip="text">
                                            Choose Date & Time
                                        </Heading>

                                        {/* Custom Calendar Picker */}
                                        <Box>
                                            <Text fontSize="sm" fontWeight="700" color="gray.700" mb={4}>Select Date</Text>
                                            <CalendarPicker />
                                        </Box>

                                        {selectedDate && (
                                            <Box>
                                                <Text fontSize="sm" fontWeight="700" color="gray.700" mb={4}>
                                                    Available Time Slots
                                                </Text>
                                                {availableSlots.length > 0 ? (
                                                    <VStack align="stretch" spacing={6}>
                                                        {(() => {
                                                            const { morning, afternoon, evening } = groupTimeSlots();
                                                            return (
                                                                <>
                                                                    {morning.length > 0 && (
                                                                        <Box>
                                                                            <HStack mb={3} spacing={2}>
                                                                                <Icon as={FiClock} color="orange.500" boxSize={5} />
                                                                                <Text fontSize="md" fontWeight="700" color="gray.700">
                                                                                    🌅 Morning (8 AM - 12 PM)
                                                                                </Text>
                                                                            </HStack>
                                                                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                                                                                {morning.map((slot, index) => (
                                                                                    <Button
                                                                                        key={index}
                                                                                        onClick={() => setSelectedTime(slot.time)}
                                                                                        variant={selectedTime === slot.time ? 'solid' : 'outline'}
                                                                                        bgGradient={selectedTime === slot.time ? 'linear(to-r, green.500, teal.500)' : 'none'}
                                                                                        color={selectedTime === slot.time ? 'white' : 'gray.700'}
                                                                                        borderColor="teal.300"
                                                                                        borderWidth="2px"
                                                                                        size="lg"
                                                                                        fontWeight="700"
                                                                                        borderRadius="xl"
                                                                                        _hover={{
                                                                                            transform: 'translateY(-2px)',
                                                                                            boxShadow: 'md'
                                                                                        }}
                                                                                        transition="all 0.2s"
                                                                                    >
                                                                                        {slot.display}
                                                                                    </Button>
                                                                                ))}
                                                                            </SimpleGrid>
                                                                        </Box>
                                                                    )}

                                                                    {afternoon.length > 0 && (
                                                                        <Box>
                                                                            <HStack mb={3} spacing={2}>
                                                                                <Icon as={FiClock} color="orange.500" boxSize={5} />
                                                                                <Text fontSize="md" fontWeight="700" color="gray.700">
                                                                                    ☀️ Afternoon (12 PM - 5 PM)
                                                                                </Text>
                                                                            </HStack>
                                                                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                                                                                {afternoon.map((slot, index) => (
                                                                                    <Button
                                                                                        key={index}
                                                                                        onClick={() => setSelectedTime(slot.time)}
                                                                                        variant={selectedTime === slot.time ? 'solid' : 'outline'}
                                                                                        bgGradient={selectedTime === slot.time ? 'linear(to-r, green.500, teal.500)' : 'none'}
                                                                                        color={selectedTime === slot.time ? 'white' : 'gray.700'}
                                                                                        borderColor="teal.300"
                                                                                        borderWidth="2px"
                                                                                        size="lg"
                                                                                        fontWeight="700"
                                                                                        borderRadius="xl"
                                                                                        _hover={{
                                                                                            transform: 'translateY(-2px)',
                                                                                            boxShadow: 'md'
                                                                                        }}
                                                                                        transition="all 0.2s"
                                                                                    >
                                                                                        {slot.display}
                                                                                    </Button>
                                                                                ))}
                                                                            </SimpleGrid>
                                                                        </Box>
                                                                    )}

                                                                    {evening.length > 0 && (
                                                                        <Box>
                                                                            <HStack mb={3} spacing={2}>
                                                                                <Icon as={FiClock} color="orange.500" boxSize={5} />
                                                                                <Text fontSize="md" fontWeight="700" color="gray.700">
                                                                                    🌙 Evening (After 5 PM)
                                                                                </Text>
                                                                            </HStack>
                                                                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                                                                                {evening.map((slot, index) => (
                                                                                    <Button
                                                                                        key={index}
                                                                                        onClick={() => setSelectedTime(slot.time)}
                                                                                        variant={selectedTime === slot.time ? 'solid' : 'outline'}
                                                                                        bgGradient={selectedTime === slot.time ? 'linear(to-r, green.500, teal.500)' : 'none'}
                                                                                        color={selectedTime === slot.time ? 'white' : 'gray.700'}
                                                                                        borderColor="teal.300"
                                                                                        borderWidth="2px"
                                                                                        size="lg"
                                                                                        fontWeight="700"
                                                                                        borderRadius="xl"
                                                                                        _hover={{
                                                                                            transform: 'translateY(-2px)',
                                                                                            boxShadow: 'md'
                                                                                        }}
                                                                                        transition="all 0.2s"
                                                                                    >
                                                                                        {slot.display}
                                                                                    </Button>
                                                                                ))}
                                                                            </SimpleGrid>
                                                                        </Box>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </VStack>
                                                ) : (
                                                    <Box
                                                        p={12}
                                                        textAlign="center"
                                                        borderRadius="2xl"
                                                        bg="gradient-to-br from-gray-50 to-gray-100"
                                                        border="2px dashed"
                                                        borderColor="gray.300"
                                                    >
                                                        <Icon as={FiClock} boxSize={16} color="gray.400" mb={4} />
                                                        <Text color="gray.700" fontWeight="700" fontSize="lg" mb={2}>
                                                            No available time slots
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            Please select another date
                                                        </Text>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        <HStack spacing={3}>
                                            <Button
                                                onClick={() => setStep(1)}
                                                variant="outline"
                                                borderColor="gray.300"
                                                borderWidth="2px"
                                                color="gray.700"
                                                size="lg"
                                                flex={1}
                                                h="56px"
                                                fontSize="lg"
                                                fontWeight="700"
                                                borderRadius="xl"
                                                _hover={{
                                                    bg: 'gray.50'
                                                }}
                                            >
                                                ← Back
                                            </Button>
                                            <Button
                                                isDisabled={!selectedDate || !selectedTime}
                                                onClick={() => setStep(3)}
                                                bgGradient="linear(to-r, green.500, teal.500)"
                                                color="white"
                                                size="lg"
                                                flex={1}
                                                h="56px"
                                                fontSize="lg"
                                                fontWeight="700"
                                                borderRadius="xl"
                                                _hover={{
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 'xl'
                                                }}
                                                transition="all 0.2s"
                                            >
                                                Next Step →
                                            </Button>
                                        </HStack>
                                    </VStack>
                                )}

                                {/* Step 3: Confirm */}
                                {step === 3 && (
                                    <VStack align="stretch" spacing={6}>
                                        <Heading size="lg" bgGradient="linear(to-r, green.600, teal.600)" bgClip="text">
                                            Confirm Appointment
                                        </Heading>

                                        <Box
                                            bgGradient="linear(to-br, green.50, teal.50)"
                                            borderRadius="2xl"
                                            p={8}
                                            border="2px solid"
                                            borderColor="teal.200"
                                            boxShadow="md"
                                        >
                                            <VStack align="stretch" spacing={5}>
                                                <Flex justify="space-between" align="center">
                                                    <Text color="gray.600" fontWeight="600">Service:</Text>
                                                    <Text fontWeight="800" color="gray.900" fontSize="lg">{selectedService?.name}</Text>
                                                </Flex>
                                                <Divider borderColor="teal.200" />
                                                <Flex justify="space-between" align="center">
                                                    <Text color="gray.600" fontWeight="600">Date:</Text>
                                                    <Text fontWeight="800" color="gray.900" fontSize="lg">
                                                        {new Date(selectedDate).toLocaleDateString('en-US', {
                                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                        })}
                                                    </Text>
                                                </Flex>
                                                <Divider borderColor="teal.200" />
                                                <Flex justify="space-between" align="center">
                                                    <Text color="gray.600" fontWeight="600">Time:</Text>
                                                    <Text fontWeight="800" color="gray.900" fontSize="lg">
                                                        {availableSlots.find(s => s.time === selectedTime)?.display}
                                                    </Text>
                                                </Flex>
                                                <Divider borderColor="teal.200" />
                                                <Flex justify="space-between" align="center">
                                                    <Text color="gray.600" fontWeight="600">Duration:</Text>
                                                    <Text fontWeight="800" color="gray.900" fontSize="lg">{selectedService?.duration_minutes} minutes</Text>
                                                </Flex>
                                            </VStack>
                                        </Box>

                                        <Box>
                                            <Text fontSize="sm" fontWeight="700" color="gray.700" mb={3}>Reason for Visit (Optional)</Text>
                                            <Textarea
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="Describe your symptoms or reason for visit..."
                                                rows={4}
                                                focusBorderColor="teal.400"
                                                borderColor="gray.300"
                                                borderWidth="2px"
                                                borderRadius="xl"
                                                resize="none"
                                                fontSize="md"
                                                _hover={{
                                                    borderColor: 'teal.300'
                                                }}
                                            />
                                        </Box>

                                        <HStack spacing={3}>
                                            <Button
                                                onClick={() => setStep(2)}
                                                variant="outline"
                                                borderColor="gray.300"
                                                borderWidth="2px"
                                                color="gray.700"
                                                size="lg"
                                                flex={1}
                                                h="56px"
                                                fontSize="lg"
                                                fontWeight="700"
                                                borderRadius="xl"
                                                _hover={{
                                                    bg: 'gray.50'
                                                }}
                                            >
                                                ← Back
                                            </Button>
                                            <Button
                                                onClick={handleBookAppointment}
                                                isLoading={loading}
                                                loadingText="Booking..."
                                                bgGradient="linear(to-r, green.500, teal.500)"
                                                color="white"
                                                size="lg"
                                                flex={1}
                                                h="56px"
                                                fontSize="lg"
                                                fontWeight="700"
                                                borderRadius="xl"
                                                leftIcon={<Icon as={FiCheckCircle} boxSize={6} />}
                                                _hover={{
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 'xl'
                                                }}
                                                transition="all 0.2s"
                                            >
                                                Confirm Booking ✓
                                            </Button>
                                        </HStack>
                                    </VStack>
                                )}
                            </VStack>
                        ) : (
                            <VStack align="stretch" spacing={6}>
                                <Heading size="lg" bgGradient="linear(to-r, teal.600, orange.600)" bgClip="text">
                                    My Appointments
                                </Heading>
                                {myAppointments.length > 0 ? (
                                    <VStack align="stretch" spacing={4}>
                                        {myAppointments.map(apt => (
                                            <Box
                                                key={apt.id}
                                                bg="white"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                borderRadius="2xl"
                                                p={6}
                                                transition="all 0.3s"
                                                _hover={{
                                                    boxShadow: 'xl',
                                                    transform: 'translateY(-2px)',
                                                    borderColor: 'teal.300'
                                                }}
                                            >
                                                <Flex justify="space-between" align="start" mb={4}>
                                                    <Heading size="md" color="gray.900" fontWeight="700">{apt.service_type}</Heading>
                                                    <Badge
                                                        colorScheme={getDisplayStatusColor(apt)}
                                                        borderRadius="full"
                                                        px={4}
                                                        py={2}
                                                        fontSize="sm"
                                                        fontWeight="700"
                                                        textTransform="uppercase"
                                                    >
                                                        {getDisplayStatus(apt)}
                                                    </Badge>
                                                </Flex>
                                                <HStack spacing={6} mb={4} fontSize="md" color="gray.600" fontWeight="600">
                                                    <HStack>
                                                        <Icon as={FiCalendar} boxSize={5} />
                                                        <Text>{new Date(apt.appointment_date).toLocaleDateString()}</Text>
                                                    </HStack>
                                                    <HStack>
                                                        <Icon as={FiClock} boxSize={5} />
                                                        <Text>{apt.appointment_time}</Text>
                                                    </HStack>
                                                </HStack>
                                                {/* Past appointment with pending/waiting status → Not Complete + Reschedule */}
                                                {['pending', 'waiting'].includes(apt.status.toLowerCase()) && isAppointmentPast(apt) && (
                                                    <HStack spacing={3}>
                                                        <Button
                                                            onClick={() => handleReschedule(apt)}
                                                            colorScheme="orange"
                                                            variant="solid"
                                                            size="md"
                                                            fontWeight="700"
                                                            leftIcon={<Icon as={FiRefreshCw} />}
                                                            borderRadius="lg"
                                                            _hover={{
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: 'md'
                                                            }}
                                                            transition="all 0.2s"
                                                        >
                                                            Reschedule
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleCancelAppointment(apt.id)}
                                                            colorScheme="red"
                                                            variant="ghost"
                                                            size="md"
                                                            fontWeight="700"
                                                            _hover={{ bg: 'red.50' }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </HStack>
                                                )}
                                                {/* Future appointment with pending status → Cancel only */}
                                                {apt.status.toLowerCase() === 'pending' && !isAppointmentPast(apt) && (
                                                    <Button
                                                        onClick={() => handleCancelAppointment(apt.id)}
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        size="md"
                                                        fontWeight="700"
                                                        _hover={{
                                                            bg: 'red.50'
                                                        }}
                                                    >
                                                        Cancel Appointment
                                                    </Button>
                                                )}
                                            </Box>
                                        ))}
                                    </VStack>
                                ) : (
                                    <VStack py={16} spacing={5}>
                                        <Text fontSize="6xl">📅</Text>
                                        <Text color="gray.600" fontSize="lg" fontWeight="600">No appointments yet</Text>
                                        <Button
                                            onClick={() => setView('book')}
                                            bgGradient="linear(to-r, green.500, teal.500)"
                                            color="white"
                                            size="lg"
                                            fontWeight="700"
                                            borderRadius="xl"
                                            px={8}
                                            _hover={{
                                                transform: 'translateY(-2px)',
                                                boxShadow: 'xl'
                                            }}
                                        >
                                            Book Your First Appointment
                                        </Button>
                                    </VStack>
                                )}
                            </VStack>
                        )}
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default Appointments;
