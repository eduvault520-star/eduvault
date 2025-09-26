import React, { createContext, useContext, useReducer } from 'react';
import api from '../utils/api';

const PaymentContext = createContext();

const initialState = {
  loading: false,
  error: null,
  currentPayment: null,
  paymentHistory: [],
};

const paymentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'PAYMENT_INITIATED':
      return {
        ...state,
        currentPayment: action.payload,
        loading: false,
        error: null,
      };
    case 'PAYMENT_COMPLETED':
      return {
        ...state,
        currentPayment: null,
        paymentHistory: [action.payload, ...state.paymentHistory],
        loading: false,
        error: null,
      };
    case 'PAYMENT_FAILED':
      return {
        ...state,
        currentPayment: null,
        loading: false,
        error: action.payload,
      };
    case 'SET_PAYMENT_HISTORY':
      return {
        ...state,
        paymentHistory: action.payload,
      };
    default:
      return state;
  }
};

export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  const initiateSubscriptionPayment = async (phoneNumber, amount = 70) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.post('/api/payments/subscription', {
        phoneNumber,
        amount,
      });

      dispatch({
        type: 'PAYMENT_INITIATED',
        payload: {
          id: response.data.paymentId,
          checkoutRequestId: response.data.checkoutRequestId,
          type: 'subscription',
          amount,
          phoneNumber,
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Payment initiation failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const initiateJobUnlockPayment = async (phoneNumber, jobId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.post('/api/payments/job-unlock', {
        phoneNumber,
        jobId,
      });

      dispatch({
        type: 'PAYMENT_INITIATED',
        payload: {
          id: response.data.paymentId,
          checkoutRequestId: response.data.checkoutRequestId,
          type: 'job_unlock',
          jobId,
          phoneNumber,
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Payment initiation failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    try {
      const response = await api.get(`/api/payments/status/${paymentId}`);
      const payment = response.data.payment;

      if (payment.status === 'completed') {
        dispatch({
          type: 'PAYMENT_COMPLETED',
          payload: payment,
        });
      } else if (payment.status === 'failed') {
        dispatch({
          type: 'PAYMENT_FAILED',
          payload: payment.failureReason || 'Payment failed',
        });
      }

      return payment;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to check payment status';
      dispatch({ type: 'SET_ERROR', payload: message });
      return null;
    }
  };

  const pollPaymentStatus = (paymentId, maxAttempts = 30, interval = 2000) => {
    return new Promise((resolve) => {
      let attempts = 0;
      
      const poll = async () => {
        attempts++;
        const payment = await checkPaymentStatus(paymentId);
        
        if (payment && (payment.status === 'completed' || payment.status === 'failed')) {
          resolve(payment);
        } else if (attempts >= maxAttempts) {
          dispatch({
            type: 'PAYMENT_FAILED',
            payload: 'Payment timeout - please check your phone and try again',
          });
          resolve(null);
        } else {
          setTimeout(poll, interval);
        }
      };
      
      poll();
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearCurrentPayment = () => {
    dispatch({ type: 'PAYMENT_COMPLETED', payload: null });
  };

  const value = {
    ...state,
    initiateSubscriptionPayment,
    initiateJobUnlockPayment,
    checkPaymentStatus,
    pollPaymentStatus,
    clearError,
    clearCurrentPayment,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
