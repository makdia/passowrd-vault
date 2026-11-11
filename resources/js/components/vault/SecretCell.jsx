import React, { useEffect, useState } from 'react';
import { App, Button, Space, Tooltip, Typography } from 'antd';
import { CopyOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { itemsApi } from '../../api';
import { errorMessage } from '../../api/client';
import { copyText } from '../../lib/clipboard';

const HIDE_AFTER_MS = 20000;

// The list API never sends passwords; this fetches one only when asked.
export default function SecretCell({ item }) {
    const { message } = App.useApp();
    const [revealed, setRevealed] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (revealed === null) return undefined;
        const timer = setTimeout(() => setRevealed(null), HIDE_AFTER_MS);
        return () => clearTimeout(timer);
    }, [revealed]);

    if (!item.has_password) return <Typography.Text type="secondary">—</Typography.Text>;

    const withPassword = (action) => {
        setBusy(true);
        itemsApi.get(item.id)
            .then((full) => action(full.password || ''))
            .catch((error) => message.error(errorMessage(error)))
            .finally(() => setBusy(false));
    };

    const copy = () => withPassword((password) => copyText(password)
        .then(() => message.success('Password copied'))
        .catch(() => message.error('Your browser blocked the copy')));

    return (
        <Space size={4}>
            <Typography.Text className="pv-mono">{revealed ?? '••••••••••'}</Typography.Text>
            <Tooltip title={revealed === null ? 'Show password' : 'Hide password'}>
                <Button
                    type="text"
                    size="small"
                    loading={busy && revealed === null}
                    aria-label={revealed === null ? `Show password for ${item.name}` : `Hide password for ${item.name}`}
                    icon={revealed === null ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={() => (revealed === null ? withPassword(setRevealed) : setRevealed(null))}
                />
            </Tooltip>
            <Tooltip title="Copy password">
                <Button type="text" size="small" aria-label={`Copy password for ${item.name}`} icon={<CopyOutlined />} onClick={copy} disabled={busy} />
            </Tooltip>
        </Space>
    );
}
