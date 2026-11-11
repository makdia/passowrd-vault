import React from 'react';
import { Button, Result, Spin } from 'antd';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function FullPageSpin() {
    return (
        <div className="pv-center-screen" role="status" aria-label="Loading">
            <Spin size="large" />
        </div>
    );
}

export function RequireAuth() {
    const { status, retry } = useAuth();
    const location = useLocation();

    if (status === 'loading') return <FullPageSpin />;
    if (status === 'offline') {
        return (
            <div className="pv-center-screen">
                <Result
                    status="warning"
                    title="Cannot reach the server"
                    subTitle="Your vault is safe. Check your connection and try again."
                    extra={<Button type="primary" onClick={retry}>Try again</Button>}
                />
            </div>
        );
    }
    if (status === 'guest') return <Navigate to="/login" replace state={{ from: location }} />;

    return <Outlet />;
}

export function GuestOnly() {
    const { status } = useAuth();
    if (status === 'loading') return <FullPageSpin />;
    if (status === 'authenticated') return <Navigate to="/" replace />;
    return <Outlet />;
}
