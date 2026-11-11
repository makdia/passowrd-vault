import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { App as AntApp, ConfigProvider, theme as antTheme } from 'antd';

const THEME_KEY = 'pv_theme';
const ThemeContext = createContext({ mode: 'light', toggle: () => {} });

function initialMode() {
    try {
        const saved = window.localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
    } catch {
        // Ignore: fall back to the system setting.
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(initialMode);

    useEffect(() => {
        document.documentElement.dataset.theme = mode;
        try {
            window.localStorage.setItem(THEME_KEY, mode);
        } catch {
            // Ignore: the choice just won't persist.
        }
    }, [mode]);

    const config = useMemo(() => ({
        algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#4f46e5',
            colorLink: mode === 'dark' ? '#a5b4fc' : '#4f46e5',
            colorBgLayout: mode === 'dark' ? '#0f1120' : '#f5f6fb',
            colorBgContainer: mode === 'dark' ? '#161a2e' : '#ffffff',
            colorBgElevated: mode === 'dark' ? '#1c2138' : '#ffffff',
            borderRadius: 10,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
            Layout: { headerBg: 'transparent', siderBg: mode === 'dark' ? '#0b0d17' : '#111827' },
            Menu: { darkItemBg: 'transparent', darkItemSelectedBg: '#4f46e5' },
        },
    }), [mode]);

    const value = useMemo(() => ({ mode, toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }), [mode]);

    return (
        <ThemeContext.Provider value={value}>
            <ConfigProvider theme={config}>
                <AntApp>{children}</AntApp>
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}

export function useThemeMode() {
    return useContext(ThemeContext);
}
