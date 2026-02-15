import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Box,
    Text,
    Link,
    Flex,
    Icon,
    Button,
} from '@chakra-ui/react';

const MapPinIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </Icon>
);

const ExternalLinkIcon = (props: any) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
);

interface GoogleMapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GoogleMapModal: React.FC<GoogleMapModalProps> = ({ isOpen, onClose }) => {
    // Coordinates for Camarin 174 Health Center
    const latitude = 14.7621;
    const longitude = 121.0491;
    const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=en&z=17&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir//${latitude},${longitude}/@${latitude},${longitude},17z`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
            <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
            <ModalContent maxH="90vh" borderRadius="2xl" overflow="hidden">
                <ModalHeader bg="teal.600" color="white" py={4}>
                    <Flex alignItems="center" gap={3}>
                        <MapPinIcon boxSize={6} />
                        <Box>
                            <Text fontSize="xl" fontWeight="bold">Camarin 174 Health Center</Text>
                            <Text fontSize="sm" fontWeight="normal" color="teal.100">
                                Cadena De Amor, Caloocan, Philippines
                            </Text>
                        </Box>
                    </Flex>
                </ModalHeader>
                <ModalCloseButton color="white" />
                <ModalBody p={0}>
                    <Box position="relative" w="100%" h="500px">
                        <iframe
                            src={mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Barangay 174 Health Center Location"
                        />
                    </Box>
                    <Box p={6} bg="gray.50">
                        <Flex gap={4} flexWrap="wrap">
                            <Button
                                as={Link}
                                href={directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                colorScheme="teal"
                                size="lg"
                                flex="1"
                                minW="200px"
                                rightIcon={<ExternalLinkIcon boxSize={4} />}
                                _hover={{ textDecoration: 'none' }}
                            >
                                Get Directions
                            </Button>
                            <Button
                                as={Link}
                                href={`https://www.google.com/maps/place/${latitude},${longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                colorScheme="teal"
                                size="lg"
                                flex="1"
                                minW="200px"
                                rightIcon={<ExternalLinkIcon boxSize={4} />}
                                _hover={{ textDecoration: 'none' }}
                            >
                                Open in Google Maps
                            </Button>
                        </Flex>
                        <Flex mt={4} p={4} bg="white" borderRadius="lg" alignItems="center" gap={3}>
                            <MapPinIcon boxSize={5} color="teal.600" />
                            <Box>
                                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                                    Full Address
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                    Cadena De Amor, Caloocan, Philippines
                                </Text>
                            </Box>
                        </Flex>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default GoogleMapModal;
