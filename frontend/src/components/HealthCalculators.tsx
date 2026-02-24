import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    FormControl,
    FormLabel,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Badge,
    Divider,
    Icon,
    SimpleGrid,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Switch,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Alert,
    AlertIcon,
    Flex,
    Button,
} from '@chakra-ui/react';
import { FiInfo, FiActivity, FiHeart, FiSettings, FiSave } from 'react-icons/fi';
import { Table, Thead, Tbody, Tr, Th, Td, useToast } from '@chakra-ui/react';

interface Props {
    user?: any;
}

const HealthCalculators: React.FC<Props> = ({ user }) => {
    const toast = useToast();

    // Unit State
    const [isMetric, setIsMetric] = useState(true);

    // History State
    const [bmiHistory, setBmiHistory] = useState<any[]>([]);
    const [bpHistory, setBpHistory] = useState<any[]>([]);
    const [isSavingBmi, setIsSavingBmi] = useState(false);
    const [isSavingBp, setIsSavingBp] = useState(false);

    // BMI State
    const [weight, setWeight] = useState<number>(70); // kg or lbs
    const [heightCm, setHeightCm] = useState<number>(170); // for metric
    const [heightFt, setHeightFt] = useState<number>(5); // for imperial
    const [heightIn, setHeightIn] = useState<number>(7); // for imperial
    const [bmi, setBmi] = useState<number>(0);
    const [bmiCategory, setBmiCategory] = useState<{ label: string, color: string, description: string }>({
        label: '-',
        color: 'gray',
        description: 'Enter your details'
    });

    // BP State
    const [systolic, setSystolic] = useState<number>(120);
    const [diastolic, setDiastolic] = useState<number>(80);
    const [bpCategory, setBpCategory] = useState<{ label: string, color: string, description: string }>({
        label: 'Normal',
        color: 'green',
        description: 'Your blood pressure is in the healthy range.'
    });

    // BMI Calculation Logic
    useEffect(() => {
        let calculatedBmi = 0;
        if (isMetric) {
            const hInM = heightCm / 100;
            calculatedBmi = weight / (hInM * hInM);
        } else {
            const totalInches = (heightFt * 12) + heightIn;
            calculatedBmi = (weight / (totalInches * totalInches)) * 703;
        }

        if (isNaN(calculatedBmi) || !isFinite(calculatedBmi)) calculatedBmi = 0;
        setBmi(calculatedBmi);

        // WHO Standards
        if (calculatedBmi === 0) {
            setBmiCategory({ label: '-', color: 'gray', description: 'Please enter valid numbers' });
        } else if (calculatedBmi < 18.5) {
            setBmiCategory({ label: 'Underweight', color: 'blue', description: 'Below healthy range. Consider consulting a nutritionist.' });
        } else if (calculatedBmi < 25) {
            setBmiCategory({ label: 'Normal', color: 'green', description: 'Healthy weight range for your height.' });
        } else if (calculatedBmi < 30) {
            setBmiCategory({ label: 'Overweight', color: 'orange', description: 'Slightly above healthy range. Balanced diet recommended.' });
        } else {
            setBmiCategory({ label: 'Obese', color: 'red', description: 'Significantly above healthy range. Consult a doctor.' });
        }
    }, [weight, heightCm, heightFt, heightIn, isMetric]);

    // BP Calculation Logic (AHA/ACC 2017 Guidelines)
    useEffect(() => {
        if (systolic >= 180 || diastolic >= 120) {
            setBpCategory({ label: 'Hypertensive Crisis', color: 'purple', description: 'Emergency! Consult your doctor immediately.' });
        } else if (systolic >= 140 || diastolic >= 90) {
            setBpCategory({ label: 'Hypertension Stage 2', color: 'red', description: 'High blood pressure. Medical intervention usually required.' });
        } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
            setBpCategory({ label: 'Hypertension Stage 1', color: 'orange', description: 'Regular monitoring and lifestyle changes recommended.' });
        } else if (systolic >= 120 && systolic < 130 && diastolic < 80) {
            setBpCategory({ label: 'Elevated', color: 'yellow', description: 'Risk of developing hypertension. Watch your diet.' });
        } else {
            setBpCategory({ label: 'Normal', color: 'green', description: 'Your blood pressure is within the healthy range.' });
        }
    }, [systolic, diastolic]);

    // Fetch History
    const fetchHistory = async () => {
        if (!user?.id) return;
        try {
            const bmiRes = await fetch(`/api/patients/${user.id}/bmi-history`);
            if (bmiRes.ok) {
                const bmiData = await bmiRes.json();
                setBmiHistory(bmiData);
            }
            const bpRes = await fetch(`/api/patients/${user.id}/bp-history`);
            if (bpRes.ok) {
                const bpData = await bpRes.json();
                setBpHistory(bpData);
            }
        } catch (error) {
            console.error('Error fetching history', error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user?.id]);

    const handleSaveBmi = async () => {
        if (!user?.id) return;
        setIsSavingBmi(true);
        try {
            const payload = {
                weight,
                height: isMetric ? heightCm : (heightFt * 12) + heightIn,
                bmi,
                unit_system: isMetric ? 'metric' : 'imperial'
            };
            const res = await fetch(`/api/patients/${user.id}/bmi-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast({ title: 'BMI Saved', status: 'success', duration: 2000 });
                fetchHistory(); // Refresh
            } else {
                toast({ title: 'Error saving BMI', status: 'error', duration: 2000 });
            }
        } catch (error) {
            console.error(error);
        }
        setIsSavingBmi(false);
    };

    const handleSaveBp = async () => {
        if (!user?.id) return;
        setIsSavingBp(true);
        try {
            const res = await fetch(`/api/patients/${user.id}/bp-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systolic, diastolic })
            });
            if (res.ok) {
                toast({ title: 'Blood Pressure Saved', status: 'success', duration: 2000 });
                fetchHistory(); // Refresh
            } else {
                toast({ title: 'Error saving BP', status: 'error', duration: 2000 });
            }
        } catch (error) {
            console.error(error);
        }
        setIsSavingBp(false);
    };

    return (
        <Box w="full">
            <VStack spacing={8} align="stretch">
                {/* Header with Unit Toggle */}
                <Flex justify="space-between" align="center" bg="white" p={6} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                    <HStack spacing={4}>
                        <Icon as={FiSettings} boxSize={5} color="teal.500" />
                        <VStack align="start" spacing={0}>
                            <Heading size="sm" color="teal.800">Tool Preferences</Heading>
                            <Text fontSize="xs" color="gray.500">Customize your measurement system</Text>
                        </VStack>
                    </HStack>
                    <FormControl display="flex" alignItems="center" w="auto">
                        <FormLabel htmlFor="unit-system" mb="0" fontSize="sm" fontWeight="600">
                            {isMetric ? 'Metric (kg/cm)' : 'Imperial (lb/ft)'}
                        </FormLabel>
                        <Switch id="unit-system" isChecked={!isMetric} onChange={() => setIsMetric(!isMetric)} colorScheme="orange" />
                    </FormControl>
                </Flex>

                <Tabs variant="soft-rounded" colorScheme="teal">
                    <TabList bg="white" p={2} borderRadius="full" boxShadow="sm" w="fit-content" border="1px solid" borderColor="gray.100">
                        <Tab px={8} fontWeight="bold"><Icon as={FiActivity} mr={2} /> BMI Calculator</Tab>
                        <Tab px={8} fontWeight="bold"><Icon as={FiHeart} mr={2} /> Blood Pressure</Tab>
                    </TabList>

                    <TabPanels mt={6}>
                        {/* BMI TAB */}
                        <TabPanel p={0}>
                            <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
                                    <VStack align="stretch" spacing={8}>
                                        {/* Weight Input */}
                                        <FormControl>
                                            <HStack justify="space-between" mb={3}>
                                                <FormLabel mb={0} fontWeight="700">Weight ({isMetric ? 'kg' : 'lbs'})</FormLabel>
                                                <NumberInput size="sm" maxW={24} value={weight} min={20} max={400} onChange={(_, val) => setWeight(val)}>
                                                    <NumberInputField borderRadius="md" fontWeight="bold" />
                                                    <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                                                </NumberInput>
                                            </HStack>
                                            <Slider min={20} max={isMetric ? 200 : 400} step={0.5} value={weight} onChange={(val) => setWeight(val)}>
                                                <SliderTrack bg="teal.50" h="2"><SliderFilledTrack bg="teal.400" /></SliderTrack>
                                                <SliderThumb boxSize={6} border="2px solid" borderColor="teal.400" />
                                            </Slider>
                                        </FormControl>

                                        {/* Height Input (Metric) */}
                                        {isMetric ? (
                                            <FormControl>
                                                <HStack justify="space-between" mb={3}>
                                                    <FormLabel mb={0} fontWeight="700">Height (cm)</FormLabel>
                                                    <NumberInput size="sm" maxW={24} value={heightCm} min={100} max={250} onChange={(_, val) => setHeightCm(val)}>
                                                        <NumberInputField borderRadius="md" fontWeight="bold" />
                                                        <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                                                    </NumberInput>
                                                </HStack>
                                                <Slider min={100} max={250} value={heightCm} onChange={(val) => setHeightCm(val)}>
                                                    <SliderTrack bg="teal.50" h="2"><SliderFilledTrack bg="teal.400" /></SliderTrack>
                                                    <SliderThumb boxSize={6} border="2px solid" borderColor="teal.400" />
                                                </Slider>
                                            </FormControl>
                                        ) : (
                                            <HStack spacing={4}>
                                                <FormControl>
                                                    <FormLabel fontWeight="700">Height (ft)</FormLabel>
                                                    <NumberInput value={heightFt} min={3} max={8} onChange={(_, val) => setHeightFt(val)}>
                                                        <NumberInputField borderRadius="md" />
                                                        <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontWeight="700">Height (in)</FormLabel>
                                                    <NumberInput value={heightIn} min={0} max={11} onChange={(_, val) => setHeightIn(val)}>
                                                        <NumberInputField borderRadius="md" />
                                                        <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                            </HStack>
                                        )}
                                    </VStack>

                                    <VStack align="stretch" spacing={6}>
                                        <Box bg={`${bmiCategory.color}.50`} p={8} borderRadius="2xl" border="1px solid" borderColor={`${bmiCategory.color}.100`} position="relative">
                                            <Stat>
                                                <StatLabel color={`${bmiCategory.color}.700`} fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Calculated BMI</StatLabel>
                                                <StatNumber fontSize="5xl" color={`${bmiCategory.color}.800`}>{bmi.toFixed(1)}</StatNumber>
                                                <StatHelpText mb={4}>
                                                    <Badge colorScheme={bmiCategory.color} variant="solid" fontSize="lg" px={4} py={1} borderRadius="full">
                                                        {bmiCategory.label}
                                                    </Badge>
                                                </StatHelpText>
                                            </Stat>
                                            <Divider borderColor={`${bmiCategory.color}.200`} mb={4} />
                                            <HStack align="start" spacing={3}>
                                                <Icon as={FiInfo} color={`${bmiCategory.color}.500`} mt={1} />
                                                <Text fontSize="md" color={`${bmiCategory.color}.700`} fontWeight="500">
                                                    {bmiCategory.description}
                                                </Text>
                                            </HStack>
                                            <Button
                                                mt={6} w="full" colorScheme={bmiCategory.color}
                                                leftIcon={<Icon as={FiSave} />}
                                                isLoading={isSavingBmi}
                                                onClick={handleSaveBmi}
                                            >
                                                Save BMI Record
                                            </Button>
                                        </Box>
                                    </VStack>
                                </SimpleGrid>

                                {/* BMI History Table */}
                                <Box mt={8} pt={8} borderTop="1px solid" borderColor="gray.100">
                                    <Heading size="sm" mb={4} color="gray.700">BMI History</Heading>
                                    {bmiHistory.length > 0 ? (
                                        <Box overflowX="auto">
                                            <Table variant="simple" size="sm">
                                                <Thead bg="gray.50">
                                                    <Tr>
                                                        <Th>Date & Time</Th>
                                                        <Th>Weight</Th>
                                                        <Th>Height</Th>
                                                        <Th>BMI</Th>
                                                        <Th>Result</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {bmiHistory.map((log) => {
                                                        const bmiVal = parseFloat(log.bmi);
                                                        let color = 'green';
                                                        let lbl = 'Normal';
                                                        if (bmiVal === 0) { color = 'gray'; lbl = 'Zero'; }
                                                        else if (bmiVal < 18.5) { color = 'blue'; lbl = 'Underweight'; }
                                                        else if (bmiVal >= 25 && bmiVal < 30) { color = 'orange'; lbl = 'Overweight'; }
                                                        else if (bmiVal >= 30) { color = 'red'; lbl = 'Obese'; }
                                                        return (
                                                            <Tr key={log.id}>
                                                                <Td>{log.created_at}</Td>
                                                                <Td>{parseFloat(log.weight).toFixed(1)} {log.unit_system === 'metric' ? 'kg' : 'lbs'}</Td>
                                                                <Td>{parseFloat(log.height).toFixed(1)} {log.unit_system === 'metric' ? 'cm' : 'inches'}</Td>
                                                                <Td fontWeight="bold">{bmiVal.toFixed(1)}</Td>
                                                                <Td><Badge colorScheme={color}>{lbl}</Badge></Td>
                                                            </Tr>
                                                        );
                                                    })}
                                                </Tbody>
                                            </Table>
                                        </Box>
                                    ) : (
                                        <Text color="gray.500" fontSize="sm">No BMI records found. Save a measurement to start tracking.</Text>
                                    )}
                                </Box>

                                <Box mt={12} p={6} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                    <Heading size="xs" mb={4} color="gray.600" textTransform="uppercase" letterSpacing="widest">Medically Important Info (WHO Standards)</Heading>
                                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                                        {[
                                            { label: 'Underweight', range: '< 18.5', color: 'blue' },
                                            { label: 'Normal', range: '18.5 - 24.9', color: 'green' },
                                            { label: 'Overweight', range: '25.0 - 29.9', color: 'orange' },
                                            { label: 'Obese', range: '30.0+', color: 'red' }
                                        ].map((item) => (
                                            <HStack key={item.label} bg="white" p={3} borderRadius="xl" boxShadow="xs" spacing={3}>
                                                <Box w={3} h={10} borderRadius="full" bg={`${item.color}.400`} />
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="xs" fontWeight="bold" color="gray.500">{item.label}</Text>
                                                    <Text fontSize="sm" fontWeight="800" color="gray.800">{item.range}</Text>
                                                </VStack>
                                            </HStack>
                                        ))}
                                    </SimpleGrid>
                                    <Text fontSize="xs" color="gray.400" mt={6} textAlign="center" fontStyle="italic">
                                        Note: BMI is a screening tool. It does not directly measure body fat or account for muscle mass, bone density, or overall body composition.
                                    </Text>
                                </Box>
                            </Box>
                        </TabPanel>

                        {/* BLOOD PRESSURE TAB */}
                        <TabPanel p={0}>
                            <Box bg="white" p={8} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="gray.100">
                                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12}>
                                    <VStack align="stretch" spacing={8}>
                                        <FormControl>
                                            <HStack justify="space-between" mb={3}>
                                                <FormLabel mb={0} fontWeight="700">Systolic (Top #)</FormLabel>
                                                <Badge colorScheme="teal" borderRadius="full" px={3}>{systolic} mmHg</Badge>
                                            </HStack>
                                            <NumberInput value={systolic} min={70} max={250} onChange={(_, val) => setSystolic(val)}>
                                                <NumberInputField borderRadius="lg" h="12" fontSize="lg" fontWeight="bold" />
                                                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                                            </NumberInput>
                                            <Text fontSize="xs" color="gray.400" mt={1}>Pressure in arteries when heart beats</Text>
                                        </FormControl>

                                        <FormControl>
                                            <HStack justify="space-between" mb={3}>
                                                <FormLabel mb={0} fontWeight="700">Diastolic (Bottom #)</FormLabel>
                                                <Badge colorScheme="teal" borderRadius="full" px={3}>{diastolic} mmHg</Badge>
                                            </HStack>
                                            <NumberInput value={diastolic} min={40} max={150} onChange={(_, val) => setDiastolic(val)}>
                                                <NumberInputField borderRadius="lg" h="12" fontSize="lg" fontWeight="bold" />
                                                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                                            </NumberInput>
                                            <Text fontSize="xs" color="gray.400" mt={1}>Pressure in arteries when heart rests</Text>
                                        </FormControl>
                                    </VStack>

                                    <VStack align="stretch" spacing={6}>
                                        <Box bg={`${bpCategory.color}.50`} p={8} borderRadius="2xl" border="1px solid" borderColor={`${bpCategory.color}.100`}>
                                            <Stat>
                                                <StatLabel color={`${bpCategory.color}.700`} fontWeight="bold" textTransform="uppercase">Status</StatLabel>
                                                <StatNumber fontSize="4xl" color={`${bpCategory.color}.800`} mb={2}>{bpCategory.label}</StatNumber>
                                                <StatHelpText>
                                                    <Heading size="md" color={`${bpCategory.color}.600`}>{systolic}/{diastolic}</Heading>
                                                    <Text fontSize="sm" mt={1}>mmHg</Text>
                                                </StatHelpText>
                                            </Stat>
                                            <Divider borderColor={`${bpCategory.color}.200`} mb={4} />
                                            <HStack align="start" spacing={3}>
                                                <Icon as={FiHeart} color={`${bpCategory.color}.500`} mt={1} />
                                                <Text fontSize="md" color={`${bpCategory.color}.700`} fontWeight="500">
                                                    {bpCategory.description}
                                                </Text>
                                            </HStack>
                                            <Button
                                                mt={6} w="full" colorScheme={bpCategory.color}
                                                leftIcon={<Icon as={FiSave} />}
                                                isLoading={isSavingBp}
                                                onClick={handleSaveBp}
                                            >
                                                Save BP Record
                                            </Button>
                                        </Box>

                                        <Alert status={bpCategory.color === 'purple' || bpCategory.color === 'red' ? 'error' : 'info'} borderRadius="xl" variant="subtle">
                                            <AlertIcon />
                                            <Box fontSize="sm">
                                                <Text fontWeight="bold">Clinical Advice:</Text>
                                                {bpCategory.label === 'Normal' ? 'Maintain healthy habits!' : 'Please consult your healthcare provider for a clinical diagnosis.'}
                                            </Box>
                                        </Alert>
                                    </VStack>
                                </SimpleGrid>

                                {/* BP History Table */}
                                <Box mt={8} pt={8} borderTop="1px solid" borderColor="gray.100">
                                    <Heading size="sm" mb={4} color="gray.700">Blood Pressure History</Heading>
                                    {bpHistory.length > 0 ? (
                                        <Box overflowX="auto">
                                            <Table variant="simple" size="sm">
                                                <Thead bg="gray.50">
                                                    <Tr>
                                                        <Th>Date & Time</Th>
                                                        <Th>Systolic</Th>
                                                        <Th>Diastolic</Th>
                                                        <Th>Result</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {bpHistory.map((log) => {
                                                        const sys = log.systolic;
                                                        const dia = log.diastolic;
                                                        let color = 'green';
                                                        let lbl = 'Normal';
                                                        if (sys >= 180 || dia >= 120) { color = 'purple'; lbl = 'Crisis'; }
                                                        else if (sys >= 140 || dia >= 90) { color = 'red'; lbl = 'Stage 2'; }
                                                        else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) { color = 'orange'; lbl = 'Stage 1'; }
                                                        else if (sys >= 120 && sys < 130 && dia < 80) { color = 'yellow'; lbl = 'Elevated'; }
                                                        return (
                                                            <Tr key={log.id}>
                                                                <Td>{log.created_at}</Td>
                                                                <Td>{sys}</Td>
                                                                <Td>{dia}</Td>
                                                                <Td><Badge colorScheme={color}>{lbl}</Badge></Td>
                                                            </Tr>
                                                        );
                                                    })}
                                                </Tbody>
                                            </Table>
                                        </Box>
                                    ) : (
                                        <Text color="gray.500" fontSize="sm">No Blood Pressure records found. Save a measurement to start tracking.</Text>
                                    )}
                                </Box>

                                <Box mt={12} p={6} bg="gray.50" borderRadius="2xl" border="1px solid" borderColor="gray.100">
                                    <Heading size="xs" mb={4} color="gray.600" textTransform="uppercase" letterSpacing="widest">AHA/ACC 2017 BP Chart</Heading>
                                    <Box overflowX="auto">
                                        <SimpleGrid columns={5} minW="400px" spacing={2}>
                                            {[
                                                { cat: 'Normal', sys: '<120', dia: '<80', c: 'green.400' },
                                                { cat: 'Elevated', sys: '120-129', dia: '<80', c: 'yellow.400' },
                                                { cat: 'Stage 1', sys: '130-139', dia: '80-89', c: 'orange.400' },
                                                { cat: 'Stage 2', sys: '>=140', dia: '>=90', c: 'red.400' },
                                                { cat: 'Crisis', sys: '>180', dia: '>120', c: 'purple.400' }
                                            ].map((item) => (
                                                <VStack key={item.cat} p={3} bg="white" borderRadius="xl" boxShadow="xs" align="center" borderBottom="4px solid" borderColor={item.c}>
                                                    <Text fontSize="10px" fontWeight="bold" color="gray.500" h="6">{item.cat}</Text>
                                                    <Text fontSize="xs" fontWeight="900" color="gray.800">{item.sys}</Text>
                                                    <Text fontSize="9px" color="gray.400">over</Text>
                                                    <Text fontSize="xs" fontWeight="900" color="gray.800">{item.dia}</Text>
                                                </VStack>
                                            ))}
                                        </SimpleGrid>
                                    </Box>
                                </Box>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
};

export default HealthCalculators;
