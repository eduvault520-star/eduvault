import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
import { useAuth } from './contexts/AuthContext';
import ButtonTest from './components/Admin/ButtonTest';

// Lazy loaded pages for better performance (Super Admin-focused)
import {
  LazyLoginPage,
  LazySuperAdminDashboard,
  PageLoader
} from './utils/lazyComponents';

// Test component for debugging
import TestLoginPage from './pages/Auth/TestLoginPage';

// Create Super Admin Theme - Dark Purple Executive Theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7c4dff', // Deep Purple
      light: '#b085f5',
      dark: '#512da8',
    },
    secondary: {
      main: '#ff4081', // Pink Accent
      light: '#ff79b0',
      dark: '#c60055',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e',
    },
    surface: {
      main: '#2d2d2d',
    },
    success: {
      main: '#00e676',
      light: '#66ffa6',
      dark: '#00b248',
    },
    warning: {
      main: '#ffc107',
      light: '#fff350',
      dark: '#c68400',
    },
    error: {
      main: '#f44336',
      light: '#ff7961',
      dark: '#ba000d',
    },
    info: {
      main: '#2196f3',
      light: '#6ec6ff',
      dark: '#0069c0',
    },
  },
  typography: {
    fontFamily: '\"Poppins\", \"Roboto\", \"Helvetica\", \"Arial\", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.2rem',
    },
  },
  shape: {
    borderRadius: 24,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 16,
          padding: '14px 32px',
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: '0 4px 16px rgba(124,77,255,0.3)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(124,77,255,0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          borderRadius: 24,
          border: '1px solid rgba(124,77,255,0.2)',
          transition: 'all 0.4s ease',
          '&:hover': {
            boxShadow: '0 20px 60px rgba(124,77,255,0.3)',
            transform: 'translateY(-4px)',
            borderColor: 'rgba(124,77,255,0.4)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#7c4dff',
          boxShadow: '0 8px 32px rgba(124,77,255,0.4)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
  },
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthRedirectListener() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  useEffect(() => {
    const handler = () => {
      try { logout && logout(); } catch (_) {}
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [navigate, logout]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <PaymentProvider>
            <SocketProvider>
              <Router>
              <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <AuthRedirectListener />
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Navigate to="/super-admin" replace />} />
                      <Route path="/button-test" element={<ButtonTest />} />
                      <Route path="/login" element={<LazyLoginPage />} />
                      <Route path="/test-login" element={<TestLoginPage />} />
                      
                      {/* Super Admin Routes */}
                      <Route path="/super-admin" element={
                        <ProtectedRoute requiredRole="super_admin">
                          <LazySuperAdminDashboard />
                        </ProtectedRoute>
                      } />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/super-admin" replace />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                <ChatbotWidget />
              </div>
            </Router>
            </SocketProvider>
          </PaymentProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
