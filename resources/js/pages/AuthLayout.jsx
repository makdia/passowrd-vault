import React from 'react';
import { Card, Typography } from 'antd';
import { SafetyCertificateFilled } from '@ant-design/icons';

export default function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <main className="pv-auth">
            <section className="pv-auth-brand" aria-hidden="true">
                <SafetyCertificateFilled className="pv-auth-brand-icon" />
                <h2>Password Vault</h2>
                <p>Every login in one place. Encrypted at rest, unlocked only by you.</p>
            </section>
            <section className="pv-auth-panel">
                <Card className="pv-auth-card" bordered={false}>
                    <div className="pv-auth-logo">
                        <SafetyCertificateFilled /> <span>Password Vault</span>
                    </div>
                    <Typography.Title level={3} style={{ marginBottom: 4 }}>{title}</Typography.Title>
                    <Typography.Paragraph type="secondary">{subtitle}</Typography.Paragraph>
                    {children}
                    {footer && <div className="pv-auth-footer">{footer}</div>}
                </Card>
            </section>
        </main>
    );
}
