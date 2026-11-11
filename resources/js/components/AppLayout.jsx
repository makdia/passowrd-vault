import React, { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Grid, Layout, Menu, Space, Tooltip, Typography } from 'antd';
import {
    DashboardOutlined,
    ExportOutlined,
    FolderOutlined,
    ImportOutlined,
    KeyOutlined,
    LogoutOutlined,
    MenuOutlined,
    MoonOutlined,
    SafetyCertificateFilled,
    SunOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useThemeMode } from '../lib/theme';

const NAV_ITEMS = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/vault', icon: <KeyOutlined />, label: 'Vault' },
    { key: '/folders', icon: <FolderOutlined />, label: 'Folders' },
    { key: '/generator', icon: <ThunderboltOutlined />, label: 'Generator' },
    { type: 'divider' },
    { key: '/import', icon: <ImportOutlined />, label: 'Import' },
    { key: '/export', icon: <ExportOutlined />, label: 'Export' },
];

function selectedKey(pathname) {
    const match = NAV_ITEMS.filter((item) => item.key && item.key !== '/' && pathname.startsWith(item.key));
    return match.length ? match[0].key : '/';
}

export default function AppLayout() {
    const { user, signOut } = useAuth();
    const { mode, toggle } = useThemeMode();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.lg;
    const [collapsed, setCollapsed] = useState(isMobile);

    useEffect(() => setCollapsed(isMobile), [isMobile]);

    const go = ({ key }) => {
        navigate(key);
        if (isMobile) setCollapsed(true);
    };

    const userMenu = {
        items: [
            { key: 'email', label: user?.email, disabled: true },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Log out', danger: true },
        ],
        onClick: ({ key }) => key === 'logout' && signOut().then(() => navigate('/login', { replace: true })),
    };

    return (
        <Layout className="pv-shell">
            <Layout.Sider
                width={232}
                collapsedWidth={0}
                collapsed={collapsed}
                trigger={null}
                className={`pv-sider${isMobile ? ' is-overlay' : ''}`}
            >
                <div className="pv-brand">
                    <SafetyCertificateFilled className="pv-brand-icon" />
                    <span>Password Vault</span>
                </div>
                <Menu theme="dark" mode="inline" selectedKeys={[selectedKey(pathname)]} items={NAV_ITEMS} onClick={go} />
            </Layout.Sider>
            {isMobile && !collapsed && <div className="pv-backdrop" onClick={() => setCollapsed(true)} aria-hidden="true" />}
            <Layout>
                <Layout.Header className="pv-header">
                    {isMobile ? (
                        <Button type="text" icon={<MenuOutlined />} aria-label="Open menu" onClick={() => setCollapsed(false)} />
                    ) : <span />}
                    <Space size="middle">
                        <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                            <Button
                                type="text"
                                shape="circle"
                                aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                                icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                                onClick={toggle}
                            />
                        </Tooltip>
                        <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
                            <Button type="text" className="pv-user-button" aria-label="Account menu">
                                <Avatar size="small" style={{ backgroundColor: '#4f46e5' }}>
                                    {user?.name?.[0]?.toUpperCase() || '?'}
                                </Avatar>
                                {!isMobile && <Typography.Text>{user?.name}</Typography.Text>}
                            </Button>
                        </Dropdown>
                    </Space>
                </Layout.Header>
                <Layout.Content className="pv-content">
                    <div className="pv-container">
                        <Outlet />
                    </div>
                </Layout.Content>
            </Layout>
        </Layout>
    );
}
