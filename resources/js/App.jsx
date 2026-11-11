import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { GuestOnly, RequireAuth } from './auth/guards';
import { ThemeProvider } from './lib/theme';
import AppLayout from './components/AppLayout';

const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vault = lazy(() => import('./pages/Vault'));
const Folders = lazy(() => import('./pages/Folders'));
const Generator = lazy(() => import('./pages/Generator'));
const Import = lazy(() => import('./pages/Import'));
const Export = lazy(() => import('./pages/Export'));

const pageFallback = (
    <div className="pv-page-loading" role="status" aria-label="Loading">
        <Spin />
    </div>
);

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Suspense fallback={pageFallback}>
                        <Routes>
                            <Route element={<GuestOnly />}>
                                <Route path="/login" element={<SignIn />} />
                                <Route path="/signup" element={<SignUp />} />
                            </Route>
                            <Route element={<RequireAuth />}>
                                <Route element={<AppLayout />}>
                                    <Route index element={<Dashboard />} />
                                    <Route path="vault" element={<Vault />} />
                                    <Route path="folders" element={<Folders />} />
                                    <Route path="generator" element={<Generator />} />
                                    <Route path="tools" element={<Navigate to="/generator" replace />} />
                                    <Route path="import" element={<Import />} />
                                    <Route path="export" element={<Export />} />
                                </Route>
                            </Route>
                            <Route path="/home" element={<Navigate to="/" replace />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}
