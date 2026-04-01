import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Textarea,
    VStack,
    useToast,
    Heading,
    Divider,
    SimpleGrid,
    Icon,
    HStack,
    Text,
    Flex,
    Select,
    Input,
    IconButton
} from '@chakra-ui/react';
import {
    FiUser,
    FiActivity,
    FiClipboard,
    FiFileText,
    FiSave,
    FiX,
    FiCheckCircle,
    FiPlus,
    FiTrash2
} from 'react-icons/fi';
import { formatSystemDate } from '../utils/dateFormatter';

interface SoapNoteFormProps {
    patientId: number;
    doctorEmail?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const FormSection = ({ label, icon, value, setValue, placeholder, color }: any) => (
    <FormControl isRequired>
        <HStack mb={3}>
            <Box p={2.5} bg={`${color}.50`} borderRadius="xl" shadow="sm">
                <Icon as={icon} color={`${color}.500`} boxSize={5} />
            </Box>
            <FormLabel fontWeight="800" color="gray.700" m={0} fontSize="sm" letterSpacing="wide">
                {label}
            </FormLabel>
        </HStack>
        <Textarea
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={5}
            bg="gray.50"
            borderColor="gray.200"
            _hover={{ borderColor: `${color}.300`, bg: 'white' }}
            _focus={{ borderColor: `${color}.500`, boxShadow: `0 0 0 1px var(--chakra-colors-${color}-500)`, bg: 'white' }}
            borderRadius="xl"
            fontSize="md"
            lineHeight="tall"
            transition="all 0.2s"
        />
    </FormControl>
);

interface SoapNoteFormProps {
    patientId: number;
    doctorEmail?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const SoapNoteForm: React.FC<SoapNoteFormProps> = ({ patientId, doctorEmail, onSuccess, onCancel }) => {
    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    // Inventory and Prescription State
    const [inventory, setInventory] = useState<any[]>([]);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await fetch('/api/inventory');
                if (res.ok) {
                    const data = await res.json();
                    setInventory(data);
                }
            } catch (err) {
                console.error("Failed to load inventory", err);
            }
        };
        fetchInventory();
    }, []);

    const MAX_MEDICINES = 10;

    const handleAddPrescription = () => {
        if (prescriptions.length >= MAX_MEDICINES) return;
        setPrescriptions([...prescriptions, { inventory_id: '', item_name: '', quantity: 1, instructions: '' }]);
    };

    const handleUpdatePrescription = (index: number, field: string, value: any) => {
        const newPrescriptions = [...prescriptions];
        newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
        // If inventory_id changed, auto-update item_name for easier history display
        if (field === 'inventory_id') {
            const selectedItem = inventory.find(item => String(item.id) === String(value));
            if (selectedItem) {
                newPrescriptions[index].item_name = selectedItem.item_name;
            } else {
                newPrescriptions[index].item_name = '';
            }
        }
        setPrescriptions(newPrescriptions);
    };

    const handleRemovePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const validPrescriptions = prescriptions.filter(p => p.inventory_id && p.quantity > 0);

            const response = await fetch('/api/soap-notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    doctor_email: doctorEmail || null,
                    subjective,
                    objective,
                    assessment,
                    plan,
                    prescription: validPrescriptions
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create SOAP note');
            }

            toast({
                title: 'SOAP Note Saved',
                description: "The clinical note has been recorded and the patient notified.",
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
            });

            // Reset form
            setSubjective('');
            setObjective('');
            setAssessment('');
            setPlan('');
            setPrescriptions([]);

            if (onSuccess) onSuccess();

        } catch (error) {
            toast({
                title: 'Submission Failed',
                description: error instanceof Error ? error.message : "Could not save SOAP note",
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
            });
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <Box
            as="form"
            onSubmit={handleSubmit}
            bg="white"
            borderRadius="xl"
            overflow="hidden"
            position="relative"
        >
            {/* Header */}
            <Box
                bg="linear-gradient(135deg, #38b2ac 0%, #ed8936 100%)"
                p={8}
                color="white"
            >
                <Flex align="center" justify="space-between">
                    <HStack spacing={6}>
                        <Box p={4} bg="whiteAlpha.300" borderRadius="2xl" shadow="lg" backdropFilter="blur(10px)">
                            <Icon as={FiFileText} boxSize={8} />
                        </Box>
                        <VStack align="start" spacing={1}>
                            <Heading size="lg" letterSpacing="tight">Clinical SOAP Note</Heading>
                            <Text fontSize="md" opacity={0.9} fontWeight="medium">Patient Consultation Record</Text>
                        </VStack>
                    </HStack>
                    <Box
                        px={4}
                        py={2}
                        bg="whiteAlpha.200"
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="800"
                        backdropFilter="blur(5px)"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                    >
                        {formatSystemDate(new Date().toISOString())}
                    </Box>
                </Flex>
            </Box>

            {/* Content */}
            <VStack spacing={10} p={10} align="stretch" bg="gray.50">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    <FormSection
                        label="SUBJECTIVE"
                        icon={FiUser}
                        value={subjective}
                        setValue={setSubjective}
                        placeholder="Patient's chief complaint, symptoms, and history of present illness..."
                        color="blue"
                    />
                    <FormSection
                        label="OBJECTIVE"
                        icon={FiActivity}
                        value={objective}
                        setValue={setObjective}
                        placeholder="Vital signs, physical examination findings, and lab results..."
                        color="green"
                    />
                </SimpleGrid>

                <Divider borderColor="gray.200" />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                    <FormSection
                        label="ASSESSMENT"
                        icon={FiClipboard}
                        value={assessment}
                        setValue={setAssessment}
                        placeholder="Clinical diagnosis, differential diagnosis, and analysis..."
                        color="purple"
                    />
                    <FormSection
                        label="PLAN"
                        icon={FiCheckCircle}
                        value={plan}
                        setValue={setPlan}
                        placeholder="Treatment plan, medications, therapy, and follow-up instructions..."
                        color="orange"
                    />
                </SimpleGrid>

                <Divider borderColor="gray.200" />

                <Box bg="white" p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor="gray.100">
                    <HStack justify="space-between" mb={6}>
                        <HStack spacing={4}>
                            <Box p={3} bg="teal.50" borderRadius="xl">
                                <Icon as={FiPlus} color="teal.500" boxSize={5} />
                            </Box>
                            <VStack align="start" spacing={0}>
                                <Text fontWeight="800" color="gray.800" fontSize="md">
                                    MEDICINE DISTRIBUTION (OPTIONAL)
                                </Text>
                                <Text fontSize="xs" color="gray.500">Attach prescriptions to this clinical record if needed</Text>
                            </VStack>
                        </HStack>
                        <Button
                            size="md"
                            colorScheme="teal"
                            variant="solid"
                            leftIcon={<FiPlus />}
                            onClick={handleAddPrescription}
                            shadow="md"
                            isDisabled={prescriptions.length >= MAX_MEDICINES}
                        >
                            Add Medicine ({prescriptions.length}/{MAX_MEDICINES})
                        </Button>
                    </HStack>

                    {prescriptions.length === 0 ? (
                        <Box py={8} textAlign="center" border="2px dashed" borderColor="gray.100" borderRadius="xl">
                            <Text fontSize="sm" color="gray.400" fontStyle="italic">No medicines prescribed for this consultation yet.</Text>
                        </Box>
                    ) : (
                        <VStack align="stretch" spacing={4}>
                            {prescriptions.map((p, index) => (
                                <Flex key={index} gap={4} align="flex-start" bg="gray.50" p={5} borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="sm">
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">Medicine</FormLabel>
                                        <Select size="md" bg="white" borderRadius="lg" value={p.inventory_id} onChange={(e) => handleUpdatePrescription(index, 'inventory_id', e.target.value)} placeholder="Select medicine">
                                            {inventory.map(item => (
                                                <option key={item.id} value={item.id} disabled={item.stock_quantity <= 0}>
                                                    {item.item_name} {item.stock_quantity <= 0 ? '(Out of Stock)' : `(${item.stock_quantity} available)`}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl w="140px" isRequired>
                                        <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">Qty</FormLabel>
                                        <Input type="number" min={1} size="md" borderRadius="lg" bg="white" value={p.quantity} onChange={(e) => handleUpdatePrescription(index, 'quantity', parseInt(e.target.value) || 0)} />
                                    </FormControl>
                                    <FormControl minW="300px" flex={3}>
                                        <FormLabel fontSize="xs" fontWeight="800" color="gray.600" textTransform="uppercase">Instructions</FormLabel>
                                        <Textarea size="md" bg="white" borderRadius="lg" value={p.instructions} onChange={(e) => handleUpdatePrescription(index, 'instructions', e.target.value)} placeholder="e.g. Take 1 tablet every 8 hours after meals" rows={3} resize="vertical" />
                                    </FormControl>
                                    <IconButton aria-label="Remove medicine" icon={<FiTrash2 />} size="md" colorScheme="red" variant="ghost" mt={8} onClick={() => handleRemovePrescription(index)} borderRadius="lg" />
                                </Flex>
                            ))}
                        </VStack>
                    )}
                </Box>

                {/* Actions */}
                <Box
                    pt={8}
                    mt={4}
                    borderTop="2px solid"
                    borderColor="gray.100"
                    display="flex"
                    justifyContent="flex-end"
                    gap={4}
                >
                    {onCancel && (
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={onCancel}
                            isDisabled={isSubmitting}
                            leftIcon={<FiX />}
                            colorScheme="gray"
                            borderRadius="xl"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        colorScheme="teal"
                        size="lg"
                        px={10}
                        isLoading={isSubmitting}
                        loadingText="Saving Record"
                        leftIcon={<FiSave />}
                        boxShadow="xl"
                        borderRadius="xl"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: '2xl' }}
                    >
                        Save Clinical Note
                    </Button>
                </Box>
            </VStack>
        </Box>
    );
};

export default SoapNoteForm;
