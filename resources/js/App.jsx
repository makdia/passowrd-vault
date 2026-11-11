import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { GuestOnly, RequireAuth } from './auth/guards';
import { ThemeProvider } from './lib/theme';
import AppLayout from './components/AppLayout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Vault from './pages/Vault';
import Folders from './pages/Folders';

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
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
                            </Route>
                        </Route>
                        <Route path="/home" element={<Navigate to="/" replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}
