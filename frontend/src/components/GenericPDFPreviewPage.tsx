import React from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    VStack,
    Text,
    Icon,
    IconButton,
    Center,
    Spinner,
} from '@chakra-ui/react';
import {
    FiArrowLeft,
    FiDownload,
    FiFileText,
    FiEye,
} from 'react-icons/fi';

interface GenericPDFPreviewPageProps {
    pdfUrl: string;
    filename: string;
    onBack: () => void;
}

const GenericPDFPreviewPage: React.FC<GenericPDFPreviewPageProps> = ({ pdfUrl, filename, onBack }) => {
    const handleDownload = () => {
        if (!pdfUrl) return;
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = filename;
        a.click();
    };

    return (
        <Box h="100vh" bg="gray.100" display="flex" flexDirection="column">
            {/* ── Top Bar ── */}
            <Flex
                as="header"
                align="center"
                justify="space-between"
                px={6}
                py={3}
                bg="white"
                borderBottom="1px solid"
                borderColor="gray.200"
                boxShadow="sm"
                position="sticky"
                top={0}
                zIndex={10}
            >
                <HStack spacing={4}>
                    <IconButton
                        aria-label="Back"
                        icon={<FiArrowLeft />}
                        variant="ghost"
                        colorScheme="teal"
                        borderRadius="xl"
                        onClick={onBack}
                    />
                    <HStack spacing={3}>
                        <Box p={2} bg="teal.50" borderRadius="lg">
                            <Icon as={FiFileText} color="teal.500" boxSize={5} />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="800" fontSize="md" color="teal.800" lineHeight="1.2">
                                Report Preview
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                                {filename}
                            </Text>
                        </VStack>
                    </HStack>
                </HStack>

                <HStack spacing={3}>
                    <Button
                        leftIcon={<FiDownload />}
                        colorScheme="teal"
                        borderRadius="xl"
                        boxShadow="md"
                        onClick={handleDownload}
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                    >
                        Download PDF
                    </Button>
                </HStack>
            </Flex>

            {/* ── Preview Area ── */}
            <Box flex={1} overflow="hidden" display="flex" flexDirection="column">
                <Flex align="center" px={6} py={2} bg="gray.800" gap={3}>
                    <HStack spacing={2}>
                        <Icon as={FiEye} color="white" boxSize={4} />
                        <Text color="white" fontSize="sm" fontWeight="700">Previewing: {filename}</Text>
                    </HStack>
                </Flex>

                <Box flex={1} overflow="hidden" p={{ base: 2, md: 6 }} bg="gray.200" display="flex" flexDirection="column">
                    <Box
                        bg="white"
                        w="full"
                        flex={1}
                        borderRadius="xl"
                        overflow="hidden"
                        boxShadow="2xl"
                        display="flex"
                    >
                        {pdfUrl ? (
                            <Box
                                as="iframe"
                                src={pdfUrl}
                                title="PDF Preview"
                                w="full"
                                h="full"
                                flex={1}
                                style={{ border: 'none', display: 'block' }}
                            />
                        ) : (
                            <Center h="full" flexDirection="column" gap={4}>
                                <Spinner size="xl" color="teal.400" thickness="4px" />
                                <Text color="gray.500" fontSize="sm">Loading PDF preview…</Text>
                            </Center>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default GenericPDFPreviewPage;
