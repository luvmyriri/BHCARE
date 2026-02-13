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
    Flex
} from '@chakra-ui/react';
import {
    FiUser,
    FiActivity,
    FiClipboard,
    FiFileText,
    FiSave,
    FiX,
    FiCheckCircle
} from 'react-icons/fi';

interface SoapNoteFormProps {
    patientId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const SoapNoteForm: React.FC<SoapNoteFormProps> = ({ patientId, onSuccess, onCancel }) => {
    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/soap-notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    subjective,
                    objective,
                    assessment,
                    plan
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
                onChange={(e) => setValue(e.target.value)}
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
