import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useAppColors } from '../ColorModeContext';
import { isAbortError } from '../api/devLog';

const LOADING_MESSAGE = 'Loading data…';
const LOADED_MESSAGE = 'Data loaded.';
const ERROR_MESSAGE = 'Error.';

const MIN_LOADING_MS = 500;

const AppSnackbarContext = createContext(null);

export function AppSnackbarProvider({ children }) {
  const colors = useAppColors();
  const [state, setState] = useState({
    open: false,
    message: '',
    severity: 'info',
    persist: false,
  });

  const requestIdRef = useRef(0);
  const pendingLoadIdRef = useRef(null);
  const loadStartedAtRef = useRef(null);
  const completeTimerRef = useRef(null);

  useEffect(() => () => {
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
    }
  }, []);

  const showSnackbar = useCallback((message, severity = 'info', options = {}) => {
    if (!message) return;
    const { persist = false } = options;
    setState({
      open: true,
      message,
      severity,
      persist,
    });
  }, []);

  const showLoading = useCallback(() => {
    showSnackbar(LOADING_MESSAGE, 'success', { persist: true });
  }, [showSnackbar]);

  const showLoaded = useCallback(() => {
    showSnackbar(LOADED_MESSAGE, 'success', { persist: false });
  }, [showSnackbar]);

  const showError = useCallback(() => {
    showSnackbar(ERROR_MESSAGE, 'error', { persist: false });
  }, [showSnackbar]);

  const beginUserLoad = useCallback(() => {
    const id = requestIdRef.current + 1;
    requestIdRef.current = id;
    pendingLoadIdRef.current = id;
    loadStartedAtRef.current = Date.now();
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
    showLoading();
    return id;
  }, [showLoading]);

  const completeUserLoad = useCallback((error, requestId) => {
    const activeId = requestId ?? pendingLoadIdRef.current;
    if (activeId == null || pendingLoadIdRef.current !== activeId) return;

    if (isAbortError(error)) {
      pendingLoadIdRef.current = null;
      loadStartedAtRef.current = null;
      return;
    }

    const startedAt = loadStartedAtRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed);

    const finish = () => {
      if (pendingLoadIdRef.current !== activeId) return;
      pendingLoadIdRef.current = null;
      loadStartedAtRef.current = null;
      completeTimerRef.current = null;
      if (error) showError();
      else showLoaded();
    };

    if (remaining === 0) {
      finish();
    } else {
      completeTimerRef.current = setTimeout(finish, remaining);
    }
  }, [showError, showLoaded]);

  const isUserLoadPending = useCallback(() => pendingLoadIdRef.current != null, []);

  const handleClose = useCallback((_event, reason) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const autoHideDuration = state.persist
    ? null
    : state.severity === 'error'
      ? 2800
      : 1333;

  const value = useMemo(() => ({
    showSnackbar,
    showLoading,
    showLoaded,
    showError,
    beginUserLoad,
    completeUserLoad,
    isUserLoadPending,
  }), [
    showSnackbar,
    showLoading,
    showLoaded,
    showError,
    beginUserLoad,
    completeUserLoad,
    isUserLoadPending,
  ]);

  return (
    <AppSnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          left: 'auto',
          right: { xs: 16, sm: 24 },
          bottom: { xs: 88, md: 72 },
          maxWidth: 320,
          zIndex: (theme) => theme.zIndex.snackbar + 20,
        }}
      >
        <Alert
          onClose={state.persist ? undefined : handleClose}
          severity={state.severity}
          variant="filled"
          sx={{
            width: '100%',
            fontSize: '0.8125rem',
            py: 0.5,
            px: 1.25,
            alignItems: 'center',
            boxShadow: colors.cardShadow,
          }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </AppSnackbarContext.Provider>
  );
}

export function useAppSnackbar() {
  const ctx = useContext(AppSnackbarContext);
  if (!ctx) {
    throw new Error('useAppSnackbar must be used within AppSnackbarProvider');
  }
  return ctx;
}

/**
 * Completes a user-triggered load snackbar when the latest query settles.
 * Call beginUserLoad() immediately on filter/control changes in the page.
 */
export function useSnackbarLoadSync({
  loading,
  error,
  queryKey,
  enabled = true,
}) {
  const { completeUserLoad, isUserLoadPending } = useAppSnackbar();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (!initialLoadDone.current && !loading) {
      initialLoadDone.current = true;
    }
  }, [loading, enabled]);

  useEffect(() => {
    if (!enabled || !initialLoadDone.current) return;
    if (!isUserLoadPending()) return;
    if (loading) return;
    completeUserLoad(error);
  }, [queryKey, loading, error, enabled, completeUserLoad, isUserLoadPending]);
}
