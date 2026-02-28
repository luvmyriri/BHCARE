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

interface SoapNoteFormProps {
    patientId: number;
    doctorEmail?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const FormSection = ({ label, icon, value, setValue, placeholder, color }: any) => (
    <FormControl isRequired>
        <HStack mb={2}>
            <Box p={2} bg={`${color}.100`} borderRadius="md">
                <Icon as={icon} color={`${color}.600`} />
            </Box>
            <FormLabel fontWeight="bold" color="gray.700" m={0} fontSize="sm">
                {label}
            </FormLabel>
        </HStack>
        <Textarea
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={4}
            bg="gray.50"
            borderColor="gray.200"
            _hover={{ borderColor: `${color}.300` }}
            _focus={{ borderColor: `${color}.500`, boxShadow: 'none', bg: 'white' }}
            borderRadius="md"
            fontSize="sm"
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

    const handleAddPrescription = () => {
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
                p={6}
                color="white"
            >
                <Flex align="center" justify="space-between">
                    <HStack spacing={4}>
                        <Box p={3} bg="whiteAlpha.200" borderRadius="lg">
                            <Icon as={FiFileText} boxSize={6} />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Heading size="md">Clinical SOAP Note</Heading>
                            <Text fontSize="sm" opacity={0.9}>Document patient consultation</Text>
                        </VStack>
                    </HStack>
                    <Box
                        px={3}
                        py={1}
                        bg="whiteAlpha.200"
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="bold"
                    >
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Box>
                </Flex>
            </Box>

            {/* Content */}
            <VStack spacing={6} p={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
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

                <Divider borderColor="gray.100" />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
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

                <Divider borderColor="gray.100" />

                <Box>
                    <HStack justify="space-between" mb={4}>
                        <HStack>
                            <Box p={2} bg="teal.100" borderRadius="md">
                                <Icon as={FiPlus} color="teal.600" />
                            </Box>
                            <FormLabel fontWeight="bold" color="gray.700" m={0} fontSize="sm">
                                MEDICINE DISTRIBUTION (OPTIONAL)
                            </FormLabel>
                        </HStack>
                        <Button size="sm" colorScheme="teal" variant="outline" leftIcon={<FiPlus />} onClick={handleAddPrescription}>
                            Add Medicine
                        </Button>
                    </HStack>

                    {prescriptions.length === 0 ? (
                        <Text fontSize="sm" color="gray.500" fontStyle="italic">No medicines prescribed.</Text>
                    ) : (
                        <VStack align="stretch" spacing={3}>
                            {prescriptions.map((p, index) => (
                                <Flex key={index} gap={3} align="flex-start" bg="gray.50" p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
                                    <FormControl isRequired>
                                        <FormLabel fontSize="xs" color="gray.600">Medicine</FormLabel>
                                        <Select size="sm" bg="white" value={p.inventory_id} onChange={(e) => handleUpdatePrescription(index, 'inventory_id', e.target.value)} placeholder="Select medicine">
                                            {inventory.map(item => (
                                                <option key={item.id} value={item.id} disabled={item.stock_quantity <= 0}>
                                                    {item.item_name} {item.stock_quantity <= 0 ? '(Out of Stock)' : `(${item.stock_quantity} available)`}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl w="120px" isRequired>
                                        <FormLabel fontSize="xs" color="gray.600">Quantity</FormLabel>
                                        <Input type="number" min={1} size="sm" bg="white" value={p.quantity} onChange={(e) => handleUpdatePrescription(index, 'quantity', parseInt(e.target.value) || 0)} />
                                    </FormControl>
                                    <FormControl minW="200px" flex={3}>
                                        <FormLabel fontSize="xs" color="gray.600">Instructions</FormLabel>
                                        <Textarea size="sm" bg="white" value={p.instructions} onChange={(e) => handleUpdatePrescription(index, 'instructions', e.target.value)} placeholder="e.g. Take 1 tablet every 8 hours" rows={3} resize="vertical" />
                                    </FormControl>
                                    <IconButton aria-label="Remove medicine" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost" mt={6} onClick={() => handleRemovePrescription(index)} />
                                </Flex>
                            ))}
                        </VStack>
                    )}
                </Box>

                {/* Actions */}
                <Box
                    pt={4}
                    mt={4}
                    borderTop="1px solid"
                    borderColor="gray.100"
                    display="flex"
                    justifyContent="flex-end"
                    gap={3}
                >
                    {onCancel && (
                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            isDisabled={isSubmitting}
                            leftIcon={<FiX />}
                            colorScheme="gray"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        colorScheme="teal"
                        size="md"
                        isLoading={isSubmitting}
                        loadingText="Saving Record"
                        leftIcon={<FiSave />}
                        boxShadow="md"
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                    >
                        Save Clinical Note
                    </Button>
                </Box>
            </VStack>
        </Box>
    );
};

export default SoapNoteForm;
