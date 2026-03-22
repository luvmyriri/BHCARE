import React, { createContext, useState, useContext, ReactNode } from 'react';

type NotificationStatus = 'success' | 'error' | 'info' | 'warning';

interface NotificationContextType {
  isOpen: boolean;
  title: string;
  message: string;
  status: NotificationStatus;
  showNotification: (title: string, message: string, status?: NotificationStatus) => void;
  closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<NotificationStatus>('info');

  const showNotification = (title: string, message: string, status: NotificationStatus = 'info') => {
    setTitle(title);
    setMessage(message);
    setStatus(status);
    setIsOpen(true);
  };

  const closeNotification = () => {
    setIsOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ isOpen, title, message, status, showNotification, closeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
