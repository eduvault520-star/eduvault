import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAIL':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Token is handled by the api interceptor, no need for manual setup

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token: token,
            },
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          // Only fail auth if it's actually a 401, not network errors
          if (error.response?.status === 401) {
            dispatch({ type: 'AUTH_FAIL', payload: 'Session expired' });
          } else {
            // For network errors, keep the token but set loading to false
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []); // Empty dependency array is correct here

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login for:', email); // Debug log
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.post('/api/auth/login', { email, password });
      console.log('AuthContext: Login response received:', response.data); // Debug log
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response.data,
      });
      
      console.log('AuthContext: Login successful'); // Debug log
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login error:', error); // Debug log
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/api/auth/register', userData);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response.data,
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const hasActiveSubscription = () => {
    return state.user?.subscription?.isActive && 
           new Date(state.user.subscription.endDate) > new Date();
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    hasRole,
    hasAnyRole,
    hasActiveSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
