import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { onUnauthorized, tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // loading | authenticated | guest | offline
    const [status, setStatus] = useState(tokenStore.get() ? 'loading' : 'guest');

    const clear = useCallback(() => {
        tokenStore.clear();
        setUser(null);
        setStatus('guest');
    }, []);

    useEffect(() => onUnauthorized(clear), [clear]);

    const loadUser = useCallback(() => {
        if (!tokenStore.get()) return;
        setStatus('loading');
        authApi.me()
            .then((me) => {
                setUser(me);
                setStatus('authenticated');
            })
            .catch((error) => (error.response?.status === 401 ? clear() : setStatus('offline')));
    }, [clear]);

    useEffect(loadUser, [loadUser]);

    const startSession = useCallback(({ token, user: signedIn }) => {
        tokenStore.set(token);
        setUser(signedIn);
        setStatus('authenticated');
    }, []);

    const value = useMemo(() => ({
        user,
        status,
        retry: loadUser,
        signIn: (values) => authApi.login(values).then(startSession),
        signUp: (values) => authApi.register(values).then(startSession),
        signOut: () => authApi.logout().catch(() => {}).finally(clear),
    }), [user, status, loadUser, startSession, clear]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
