
import React, { useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export const useCustomToast = () => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = useCallback((message: string, severity: AlertColor = 'info') => {
    setToast({
      open: true,
      message,
      severity,
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  const ToastComponent = React.useMemo(() => (
    <Snackbar
      open={toast.open}
      autoHideDuration={6000}
      onClose={hideToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={hideToast} severity={toast.severity} sx={{ width: '100%' }}>
        {toast.message}
      </Alert>
    </Snackbar>
  ), [toast, hideToast]);

  return {
    showSuccess,
    showError,
    showWarning,
    showToast,
    ToastComponent,
  };
};
