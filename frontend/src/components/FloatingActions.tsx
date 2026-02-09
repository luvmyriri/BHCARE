import { useEffect, useState } from 'react';
import {
    Box,
    IconButton,
    VStack,
    Tooltip,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Text,
    Icon,
    HStack,
} from '@chakra-ui/react';
import { FiArrowUp, FiPlusCircle, FiShare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

const FloatingActions = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Scroll listener
        const handleScroll = () => {
            setShowScrollTop(window.pageYOffset > 300);
        };
        window.addEventListener('scroll', handleScroll);

        // PWA logic
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true);
        }
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

        const installHandler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', installHandler);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeinstallprompt', installHandler);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    setDeferredPrompt(null);
                }
            });
        } else {
            setShowInstructions(true);
        }
    };

    const showInstall = !isStandalone && isMobile;

    return (
        <>
            <Box position="fixed" bottom="30px" right="30px" zIndex={2000}>
                <VStack spacing={3}>
                    <AnimatePresence>
                        {showScrollTop && (
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                <Tooltip label="Back to Top" placement="left">
                                    <IconButton
                                        aria-label="Back to Top"
                                        icon={<FiArrowUp />}
                                        onClick={scrollToTop}
                                        colorScheme="whiteAlpha"
                                        bg="rgba(255, 255, 255, 0.8)"
                                        color="teal.600"
                                        backdropFilter="blur(10px)"
                                        borderRadius="full"
                                        boxShadow="xl"
                                        border="1px solid"
                                        borderColor="whiteAlpha.400"
                                        size="lg"
                                        _hover={{ bg: "white", transform: "translateY(-2px)" }}
                                    />
                                </Tooltip>
                            </MotionBox>
                        )}
                    </AnimatePresence>

                    {showInstall && (
                        <Tooltip label="Install App" placement="left">
                            <IconButton
                                aria-label="Install App"
                                icon={<FiPlusCircle />}
                                onClick={handleInstallClick}
                                colorScheme="teal"
                                bg="linear-gradient(135deg, #38b2ac 0%, #ed8936 100%)"
                                color="white"
                                borderRadius="full"
                                boxShadow="xl"
                                size="lg"
                                _hover={{ opacity: 0.9, transform: "scale(1.1)" }}
                            />
                        </Tooltip>
                    )}
                </VStack>
            </Box>

            <Modal isOpen={showInstructions} onClose={() => setShowInstructions(false)} size="sm">
                <ModalOverlay />
                <ModalContent borderRadius="xl" m={4}>
                    <ModalHeader fontSize="md">Install BHCare 174</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="start">
                            <Text fontSize="sm">To install this app on your device:</Text>
                            {isIOS ? (
                                <Box bg="gray.50" p={4} borderRadius="md" w="full">
                                    <HStack mb={2}>
                                        <Text fontWeight="bold" fontSize="sm">1.</Text>
                                        <Text fontSize="sm">Tap the <Icon as={FiShare} mx={1} /> Share button</Text>
                                    </HStack>
                                    <HStack>
                                        <Text fontWeight="bold" fontSize="sm">2.</Text>
                                        <Text fontSize="sm">Select <strong>"Add to Home Screen"</strong></Text>
                                    </HStack>
                                </Box>
                            ) : (
                                <Box bg="gray.50" p={4} borderRadius="md" w="full">
                                    <Text fontSize="sm">Tap the menu icon (three dots) in your browser and select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</Text>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default FloatingActions;
