import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  Icon,
  Box,
} from '@chakra-ui/react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { useNotification } from '../contexts/NotificationContext';

const NotificationModal: React.FC = () => {
  const { isOpen, title, message, status, closeNotification } = useNotification();

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return { icon: FiCheckCircle, color: 'green.500', bg: 'green.50' };
      case 'error':
        return { icon: FiAlertCircle, color: 'red.500', bg: 'red.50' };
      case 'warning':
        return { icon: FiAlertTriangle, color: 'orange.500', bg: 'orange.50' };
      case 'info':
      default:
        return { icon: FiInfo, color: 'blue.500', bg: 'blue.50' };
    }
  };

  const config = getStatusConfig();

  return (
    <Modal isOpen={isOpen} onClose={closeNotification} isCentered size="sm">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalHeader textAlign="center" pt={6}>
          <VStack spacing={4}>
            <Box p={4} borderRadius="full" bg={config.bg}>
              <Icon as={config.icon} boxSize={8} color={config.color} />
            </Box>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              {title}
            </Text>
          </VStack>
        </ModalHeader>
        <ModalBody textAlign="center" pb={6}>
          <Text color="gray.600">
            {message}
          </Text>
        </ModalBody>
        <ModalFooter justifyContent="center" pb={6}>
          <Button colorScheme={status === 'error' ? 'red' : 'teal'} onClick={closeNotification} minW="120px" borderRadius="full">
            Okay
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NotificationModal;
