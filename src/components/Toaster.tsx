'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          theme: {
            primary: '#4a90e2',
            secondary: '#black',
          },
        },
        error: {
          duration: 5000,
          theme: {
            primary: '#e74c3c',
            secondary: '#black',
          },
        },
      }}
    />
  );
} 