import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Heading,
    Text,
    VStack,
    HStack,
    Input,
    Textarea,
    useToast,
    Card,
    CardBody,
    Badge,
    Icon,
    Flex,
    SimpleGrid,
    Stack,
    Divider,
} from '@chakra-ui/react';
import { FiCalendar, FiClock, FiCheck, FiArrowRight } from 'react-icons/fi';

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
}

const Appointments: React.FC<AppointmentsProps> = ({ user }) => {
    const toast = useToast();
    const [step, setStep] = useState(1);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [reason, setReason] = useState('');
    const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'book' | 'my-appointments'>('book');

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
            const response = await fetch(`/api/available-slots?date=${selectedDate}`);
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
            setMyAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedService || !selectedDate || !selectedTime) {
            toast({
                title: 'Missing Information',
                description: 'Please complete all fields',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    appointment_date: selectedDate,
                    appointment_time: selectedTime,
                    service_type: selectedService.name,
                    reason: reason
                })
            });

            if (response.ok) {
                toast({
                    title: 'Appointment Booked!',
                    description: 'Your appointment has been successfully scheduled.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                setStep(1);
                setSelectedService(null);
                setSelectedDate('');
                setSelectedTime('');
                setReason('');
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
                description: 'An error occurred while booking',
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
                body: JSON.stringify({ reason: 'Cancelled by patient' })
            });

            if (response.ok) {
                toast({
                    title: 'Cancelled',
                    description: 'Appointment cancelled successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                fetchMyAppointments();
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

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'blue';
            case 'confirmed': return 'green';
            case 'cancelled': return 'red';
            case 'completed': return 'gray';
            default: return 'gray';
        }
    };

    return (
        <Box bg="white" borderRadius="xl" p={6} boxShadow="sm" minH="500px">
            {/* Header */}
            <Flex alignItems="center" justifyContent="space-between" mb={6}>
                <Heading size="lg" color="teal.800">Appointments</Heading>
            </Flex>

            {/* View Toggle */}
            <Flex justifyContent="center" mb={8}>
                <Box bg="gray.100" p={1} borderRadius="lg">
                    <Button
                        variant={view === 'book' ? 'solid' : 'ghost'}
                        colorScheme={view === 'book' ? 'teal' : 'gray'}
                        size="md"
                        onClick={() => setView('book')}
                        mr={1}
                    >
                        Book Appointment
                    </Button>
                    <Button
                        variant={view === 'my-appointments' ? 'solid' : 'ghost'}
                        colorScheme={view === 'my-appointments' ? 'teal' : 'gray'}
                        size="md"
                        onClick={() => setView('my-appointments')}
                    >
                        My Appointments
                    </Button>
                </Box>
            </Flex>

            {view === 'book' ? (
                <Box w="full">
                    {/* Step Indicator */}
                    <Flex justifyContent="center" mb={10} alignItems="center">
                        {[
                            { step: 1, label: 'Service' },
                            { step: 2, label: 'Date & Time' },
                            { step: 3, label: 'Confirm' }
                        ].map((s, index) => (
                            <React.Fragment key={s.step}>
                                <VStack spacing={2}>
                                    <Flex
                                        w={10}
                                        h={10}
                                        borderRadius="full"
                                        bg={step >= s.step ? 'teal.500' : 'gray.200'}
                                        color={step >= s.step ? 'white' : 'gray.500'}
                                        alignItems="center"
                                        justifyContent="center"
                                        fontWeight="bold"
                                        transition="all 0.3s"
                                    >
                                        {s.step}
                                    </Flex>
                                    <Text fontSize="xs" color="gray.600" fontWeight="medium">{s.label}</Text>
                                </VStack>
                                {index < 2 && (
                                    <Box w={20} h="2px" bg={step > s.step ? 'teal.500' : 'gray.200'} mx={2} mt="-1.5rem" />
                                )}
                            </React.Fragment>
                        ))}
                    </Flex>

                    {/* Step 1: Select Service */}
                    {step === 1 && (
                        <VStack spacing={6} align="stretch" as={Box} width="100%">
                            <Heading size="md" textAlign="center" mb={2}>Select a Service</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                {services.map(service => (
                                    <Card
                                        key={service.id}
                                        onClick={() => setSelectedService(service)}
                                        cursor="pointer"
                                        variant="outline"
                                        borderColor={selectedService?.id === service.id ? 'teal.500' : 'gray.200'}
                                        borderWidth={2}
                                        bg={selectedService?.id === service.id ? 'teal.50' : 'white'}
                                        _hover={{ borderColor: 'teal.500', transform: 'translateY(-2px)' }}
                                        transition="all 0.2s"
                                    >
                                        <CardBody>
                                            <Flex gap={4}>
                                                <Text fontSize="3xl">🏥</Text>
                                                <Box>
                                                    <Heading size="sm" mb={1}>{service.name}</Heading>
                                                    <Text fontSize="sm" color="gray.600" mb={3}>{service.description}</Text>
                                                    <Badge colorScheme="teal" borderRadius="full">
                                                        {service.duration_minutes} mins
                                                    </Badge>
                                                </Box>
                                            </Flex>
                                        </CardBody>
                                    </Card>
                                ))}
                            </SimpleGrid>
                            <Button
                                isDisabled={!selectedService}
                                onClick={() => setStep(2)}
                                colorScheme="teal"
                                size="lg"
                                rightIcon={<FiArrowRight />}
                                width="full"
                                mt={4}
                            >
                                Next Step
                            </Button>
                        </VStack>
                    )}

                    {/* Step 2: Select Date & Time */}
                    {step === 2 && (
                        <VStack spacing={6} align="stretch">
                            <Heading size="md" textAlign="center">Choose Date & Time</Heading>

                            <Box>
                                <Text mb={2} fontWeight="medium">Select Date</Text>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedTime('');
                                    }}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    size="lg"
                                    borderColor="gray.300"
                                    _focus={{ borderColor: 'teal.500', ring: 'none' }}
                                />
                            </Box>

                            {selectedDate && (
                                <Box>
                                    <Text mb={3} fontWeight="medium">Available Time Slots</Text>
                                    {availableSlots.length > 0 ? (
                                        <SimpleGrid columns={{ base: 3, md: 4 }} spacing={3}>
                                            {availableSlots.map((slot, index) => (
                                                <Button
                                                    key={index}
                                                    onClick={() => setSelectedTime(slot.time)}
                                                    variant={selectedTime === slot.time ? 'solid' : 'outline'}
                                                    colorScheme="teal"
                                                    fontWeight="medium"
                                                >
                                                    {slot.display}
                                                </Button>
                                            ))}
                                        </SimpleGrid>
                                    ) : (
                                        <Flex direction="column" align="center" justify="center" p={8} bg="gray.50" borderRadius="lg">
                                            <Text color="gray.500">No available slots for this date</Text>
                                        </Flex>
                                    )}
                                </Box>
                            )}

                            <HStack spacing={4} pt={4}>
                                <Button
                                    onClick={() => setStep(1)}
                                    variant="outline"
                                    size="lg"
                                    width="full"
                                >
                                    Back
                                </Button>
                                <Button
                                    isDisabled={!selectedDate || !selectedTime}
                                    onClick={() => setStep(3)}
                                    colorScheme="teal"
                                    size="lg"
                                    width="full"
                                    rightIcon={<FiArrowRight />}
                                >
                                    Next Step
                                </Button>
                            </HStack>
                        </VStack>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <VStack spacing={6} align="stretch">
                            <Heading size="md" textAlign="center">Confirm Appointment</Heading>

                            <Card variant="filled" bg="teal.50">
                                <CardBody>
                                    <Stack spacing={4}>
                                        <Flex justify="space-between">
                                            <Text color="gray.600">Service</Text>
                                            <Text fontWeight="bold">{selectedService?.name}</Text>
                                        </Flex>
                                        <Divider borderColor="teal.200" />
                                        <Flex justify="space-between">
                                            <Text color="gray.600">Date</Text>
                                            <Text fontWeight="bold">
                                                {new Date(selectedDate).toLocaleDateString('en-US', {
                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </Text>
                                        </Flex>
                                        <Divider borderColor="teal.200" />
                                        <Flex justify="space-between">
                                            <Text color="gray.600">Time</Text>
                                            <Text fontWeight="bold">
                                                {availableSlots.find(s => s.time === selectedTime)?.display}
                                            </Text>
                                        </Flex>
                                        <Divider borderColor="teal.200" />
                                        <Flex justify="space-between">
                                            <Text color="gray.600">Duration</Text>
                                            <Text fontWeight="bold">{selectedService?.duration_minutes} minutes</Text>
                                        </Flex>
                                    </Stack>
                                </CardBody>
                            </Card>

                            <Box>
                                <Text mb={2} fontWeight="medium">Reason for Visit (Optional)</Text>
                                <Textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Describe your symptoms or reason for visit..."
                                    rows={4}
                                    resize="none"
                                    borderColor="gray.300"
                                    _focus={{ borderColor: 'teal.500', ring: 'none' }}
                                />
                            </Box>

                            <HStack spacing={4} pt={4}>
                                <Button
                                    onClick={() => setStep(2)}
                                    variant="outline"
                                    size="lg"
                                    width="full"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleBookAppointment}
                                    isLoading={loading}
                                    loadingText="Booking..."
                                    colorScheme="teal"
                                    size="lg"
                                    width="full"
                                    leftIcon={<FiCheck />}
                                >
                                    Confirm Booking
                                </Button>
                            </HStack>
                        </VStack>
                    )}
                </Box>
            ) : (
                /* My Appointments View */
                <Box>
                    <Heading size="md" mb={6}>My Appointments</Heading>
                    {myAppointments.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                            {myAppointments.map(apt => (
                                <Card key={apt.id} variant="outline" _hover={{ shadow: 'md' }}>
                                    <CardBody>
                                        <Flex justify="space-between" align="start">
                                            <Box>
                                                <Heading size="sm" mb={2}>{apt.service_type}</Heading>
                                                <HStack spacing={4} color="gray.600" fontSize="sm" mb={3}>
                                                    <Flex align="center" gap={2}>
                                                        <Icon as={FiCalendar} />
                                                        <Text>{new Date(apt.appointment_date).toLocaleDateString()}</Text>
                                                    </Flex>
                                                    <Flex align="center" gap={2}>
                                                        <Icon as={FiClock} />
                                                        <Text>{apt.appointment_time}</Text>
                                                    </Flex>
                                                </HStack>
                                            </Box>
                                            <Badge colorScheme={getStatusColor(apt.status)} fontSize="sm" px={2} py={1} borderRadius="full">
                                                {apt.status}
                                            </Badge>
                                        </Flex>
                                        {apt.status === 'pending' && (
                                            <Flex justify="flex-end" mt={2}>
                                                <Button
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => handleCancelAppointment(apt.id)}
                                                >
                                                    Cancel Appointment
                                                </Button>
                                            </Flex>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>
                    ) : (
                        <Flex direction="column" align="center" justify="center" py={12} bg="gray.50" borderRadius="xl">
                            <Text color="gray.500" mb={4}>No appointments yet</Text>
                            <Button colorScheme="teal" onClick={() => setView('book')}>
                                Book Your First Appointment
                            </Button>
                        </Flex>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Appointments;
