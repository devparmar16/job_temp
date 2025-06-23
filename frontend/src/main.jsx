import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/authContext.jsx';
import { JobProvider } from './contexts/jobContext.jsx';
import { ApplicationProvider } from './contexts/applicationContext.jsx';
import { SocketProvider } from './contexts/chatContext.jsx';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <JobProvider>
          <ApplicationProvider>
    <App />
            <Toaster />
          </ApplicationProvider>
        </JobProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>,
)
