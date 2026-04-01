import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    HStack,
    Icon,
    Text,
    Box,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { FiDownload, FiEye, FiX } from 'react-icons/fi';

interface PDFPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Blob URL produced by jsPDF's doc.output('bloburl') */
    pdfUrl: string | null;
    /** The filename used when the user clicks Download */
    filename: string;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ isOpen, onClose, pdfUrl, filename }) => {

    const handleDownload = () => {
        if (!pdfUrl) return;
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = filename;
        a.click();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            isCentered
            scrollBehavior="inside"
        >
            <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
            <ModalContent borderRadius="2xl" overflow="hidden" maxH="90vh">
                {/* Header */}
                <ModalHeader
                    bg="linear-gradient(135deg, #38b2ac 0%, #ed8936 100%)"
                    color="white"
                    py={4}
                >
                    <HStack spacing={3}>
                        <Icon as={FiEye} boxSize={5} />
                        <Box>
                            <Text fontWeight="800" fontSize="md">PDF Preview</Text>
                            <Text fontSize="xs" opacity={0.85} fontWeight="400">{filename}</Text>
                        </Box>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color="white" top={4} right={4} />

                {/* Body — iframe */}
                <ModalBody p={0} bg="gray.100" flex={1} overflow="hidden">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            title="PDF Preview"
                            width="100%"
                            height="600px"
                            style={{ border: 'none', display: 'block' }}
                        />
                    ) : (
                        <Center h="400px">
                            <Spinner size="xl" color="teal.500" />
                        </Center>
                    )}
                </ModalBody>

                {/* Footer */}
                <ModalFooter bg="gray.50" borderTopWidth="1px" gap={3}>
                    <Button
                        variant="ghost"
                        leftIcon={<Icon as={FiX} />}
                        onClick={onClose}
                        colorScheme="gray"
                    >
                        Close
                    </Button>
                    <Button
                        colorScheme="teal"
                        leftIcon={<Icon as={FiDownload} />}
                        onClick={handleDownload}
                        isDisabled={!pdfUrl}
                        boxShadow="md"
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                    >
                        Download PDF
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default PDFPreviewModal;
