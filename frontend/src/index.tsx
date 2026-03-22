import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import './index.css';
import './Animations.css';
import App from './App';

import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationModal from './components/NotificationModal';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ChakraProvider>
        <LanguageProvider>
          <NotificationProvider>
            <App />
            <NotificationModal />
          </NotificationProvider>
        </LanguageProvider>
      </ChakraProvider>
    </React.StrictMode>
  );
}
