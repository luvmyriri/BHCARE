import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { LanguageProvider } from './contexts/LanguageContext';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ChakraProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ChakraProvider>
    </React.StrictMode>
  );
}

reportWebVitals();
