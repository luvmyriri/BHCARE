import React, { useState, useEffect } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    Badge,
    Icon,
    Tooltip,
    Flex,
} from '@chakra-ui/react';
import { FiUsers, FiClock, FiActivity } from 'react-icons/fi';

const HealthCenterStatus: React.FC = () => {
    const [statusData, setStatusData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/center-status');
                if (res.ok) {
                    const data = await res.json();
                    setStatusData(data);
                }
            } catch (e) {
                console.error("Failed to fetch center status", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // 30 sec updates
        return () => clearInterval(interval);
    }, []);

    if (loading || !statusData) return null;

    const { status, color, message, waiting_count, remaining_slots } = statusData;

    return (
        <Tooltip label={message} placement="bottom-start" hasArrow>
            <Box
                bg="white"
                p={4}
                borderRadius="2xl"
                boxShadow="xl"
                border="1px solid"
                borderColor={`${color}.100`}
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-2px)', boxShadow: '2xl' }}
                cursor="help"
                overflow="hidden"
                position="relative"
            >
                <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between" align="center">
                        <HStack spacing={2}>
                            <Box
                                w={3}
                                h={3}
                                borderRadius="full"
                                bg={`${color}.500`}
                                animation="pulse 2s infinite"
                            />
                            <Text fontWeight="800" fontSize="sm" color="gray.700" letterSpacing="wide">
                                CENTER STATUS: {status}
                            </Text>
                        </HStack>
                        <Badge colorScheme={color} variant="solid" rounded="full" px={3} fontSize="xs">
                            LIVE
                        </Badge>
                    </HStack>

                    <Flex gap={4}>
                        <VStack align="start" spacing={0} flex="1">
                            <HStack spacing={1} color="gray.500">
                                <Icon as={FiUsers} boxSize={3} />
                                <Text fontSize="10px" fontWeight="bold" textTransform="uppercase">Queued</Text>
                            </HStack>
                            <Text fontSize="lg" fontWeight="800" color="teal.800">{waiting_count}</Text>
                        </VStack>

                        <Divider orientation="vertical" h="30px" />

                        <VStack align="start" spacing={0} flex="1">
                            <HStack spacing={1} color="gray.500">
                                <Icon as={FiActivity} boxSize={3} />
                                <Text fontSize="10px" fontWeight="bold" textTransform="uppercase">Remaining</Text>
                            </HStack>
                            <Text fontSize="lg" fontWeight="800" color={remaining_slots < 5 ? 'red.500' : 'orange.500'}>
                                {remaining_slots} slots
                            </Text>
                        </VStack>
                    </Flex>

                    <Text fontSize="xs" color="gray.400" fontStyle="italic" textAlign="center">
                        {message}
                    </Text>
                </VStack>

                <style>
                    {`
                        @keyframes pulse {
                            0% { transform: scale(0.95); opacity: 1; }
                            50% { transform: scale(1.1); opacity: 0.7; }
                            100% { transform: scale(0.95); opacity: 1; }
                        }
                    `}
                </style>
            </Box>
        </Tooltip>
    );
};

const Divider = ({ orientation, h }: any) => (
    <Box
        w={orientation === 'vertical' ? '1px' : 'full'}
        h={h || (orientation === 'vertical' ? 'full' : '1px')}
        bg="gray.100"
    />
);

export default HealthCenterStatus;
