import React from 'react';
import { Typography } from 'antd';

export default function PageHeader({ title, subtitle, extra }) {
    return (
        <header className="pv-page-header">
            <div>
                <Typography.Title level={2} style={{ margin: 0 }}>{title}</Typography.Title>
                {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
            </div>
            {extra && <div className="pv-page-header-extra">{extra}</div>}
        </header>
    );
}
