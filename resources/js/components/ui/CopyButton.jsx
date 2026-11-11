import React from 'react';
import { App, Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { copyText } from '../../lib/clipboard';

export default function CopyButton({ text, label = 'Copy', successMessage = 'Copied' }) {
    const { message } = App.useApp();
    if (!text) return null;

    return (
        <Tooltip title={label}>
            <Button
                type="text"
                size="small"
                aria-label={label}
                icon={<CopyOutlined />}
                onClick={(event) => {
                    event.stopPropagation();
                    copyText(text).then(() => message.success(successMessage)).catch(() => message.error('Your browser blocked the copy'));
                }}
            />
        </Tooltip>
    );
}
