import { useEffect, useState } from 'react';
import {
    Button,
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Text,
    VStack,
    Icon,
    HStack
} from '@chakra-ui/react';
import { FiShare } from 'react-icons/fi';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true);
        }

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        // Check if Mobile
        const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(mobileCheck);

        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    setDeferredPrompt(null);
                }
            });
        } else {
            // If no prompt available (like iOS or blocked), show manual instructions
            setShowInstructions(true);
        }
    };

    if (isStandalone || !isMobile) return null;

    return (
        <>
            <Box position="fixed" bottom="20px" right="20px" zIndex={2000}>
                <Button
                    onClick={handleInstallClick}
                    colorScheme="teal"
                    size="lg"
                    boxShadow="lg"
                    rounded="full"
                >
                    Install App
                </Button>
            </Box>

            <Modal isOpen={showInstructions} onClose={() => setShowInstructions(false)} size="sm">
                <ModalOverlay />
                <ModalContent borderRadius="xl" m={4}>
                    <ModalHeader>Install BHCare 174</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="start">
                            <Text>To install this app on your device:</Text>

                            {isIOS ? (
                                <Box bg="gray.50" p={4} borderRadius="md" w="full">
                                    <HStack mb={2}>
                                        <Text fontWeight="bold">1.</Text>
                                        <Text>Tap the <Icon as={FiShare} mx={1} /> Share button</Text>
                                    </HStack>
                                    <HStack>
                                        <Text fontWeight="bold">2.</Text>
                                        <Text>Select <strong>"Add to Home Screen"</strong></Text>
                                    </HStack>
                                </Box>
                            ) : (
                                <Box bg="gray.50" p={4} borderRadius="md" w="full">
                                    <Text mb={2}>Tap the menu icon (three dots) in your browser and select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</Text>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default InstallPWA;
