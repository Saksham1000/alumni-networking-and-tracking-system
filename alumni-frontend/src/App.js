import React, { useContext, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

/**
 * Main Application Component
 * Sets up routing, theming, and authentication context
 * Manages dark/light mode theme switching
 */
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AlumniSearchPage from './pages/AlumniSearchPage';
import EventsPage from './pages/EventsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import JobBoardPage from './pages/JobBoardPage';
import JobPostDetailPage from './pages/JobPostDetailPage';
import MyConnectionsPage from './pages/MyConnectionsPage';
import Navbar from './components/Navbar';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import PublicProfilePage from './pages/PublicProfilePage';
import MessagesPage from './pages/MessagesPage';
import GlobalSearchPage from './pages/GlobalSearchPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminReportsPage from './pages/AdminReportsPage';

// ============================================================================
// THEME CONFIGURATION
// ============================================================================
// Define light and dark themes with consistent color palette
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0077B6' },
    secondary: { main: '#00B4D8' },
    background: { default: '#F8F9FA', paper: '#FFFFFF' },
    text: { primary: '#212529', secondary: '#6c757d' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: { styleOverrides: { root: { backgroundColor: '#FFFFFF', color: '#212529', boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 8, padding: '10px 20px' } } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease-in-out', '&:hover': { boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.1)' } } } },
  }
});
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#00B4D8' },
    background: { default: '#181A1B', paper: '#23272A' },
    text: { primary: '#F8F9FA', secondary: '#B0B3B8' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
});

const ThemeModeContext = React.createContext({ toggleTheme: () => {}, mode: 'light' });

export function useThemeMode() { return useContext(ThemeModeContext); }

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);
  const toggleTheme = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };
  return (
    <AuthProvider>
      <SnackbarProvider>
        <ThemeModeContext.Provider value={{ toggleTheme, mode }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Navbar toggleTheme={toggleTheme} mode={mode} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/profile/:id" element={<PublicProfilePage />} />

                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/alumni" element={<PrivateRoute><AlumniSearchPage /></PrivateRoute>} />
                <Route path="/events" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
                <Route path="/jobs" element={<PrivateRoute><JobBoardPage /></PrivateRoute>} />
                <Route path="/jobs/:id" element={<PrivateRoute><JobPostDetailPage /></PrivateRoute>} />
                <Route path="/my-connections" element={<PrivateRoute><MyConnectionsPage /></PrivateRoute>} />
                <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
                <Route path="/search" element={<PrivateRoute><GlobalSearchPage /></PrivateRoute>} />
                <Route path="/recommendations" element={<PrivateRoute><RecommendationsPage /></PrivateRoute>} />

                <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={['admin']}><AdminDashboardPage /></RoleRoute>} />
                <Route path="/admin/reports" element={<PrivateRoute><AdminReportsPage /></PrivateRoute>} />
                
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </ThemeProvider>
        </ThemeModeContext.Provider>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
