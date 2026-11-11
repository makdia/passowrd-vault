import React, { useState } from 'react';
import { Alert, App, Button, Card, Space, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import PageHeader from '../components/ui/PageHeader';
import { vaultApi } from '../api';
import { errorMessage } from '../api/client';
import { downloadBlob } from '../lib/format';

export default function Export() {
    const { message } = App.useApp();
    const [exporting, setExporting] = useState(false);

    const download = () => {
        setExporting(true);
        vaultApi.exportCsv()
            .then((blob) => {
                downloadBlob(blob, `password-vault-${new Date().toISOString().slice(0, 10)}.csv`);
                message.success('Export downloaded');
            })
            .catch((error) => message.error(errorMessage(error)))
            .finally(() => setExporting(false));
    };

    return (
        <>
            <PageHeader title="Export" subtitle="Download every item as a CSV file you can import again later." />
            <Card style={{ maxWidth: 640 }}>
                <Space direction="vertical" size={16}>
                    <Alert
                        type="warning"
                        showIcon
                        message="The file is not encrypted"
                        description="It contains your passwords in plain text. Store it somewhere safe and delete it when you no longer need it."
                    />
                    <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                        Columns: id, name, type, folder, username, password, website, notes.
                    </Typography.Paragraph>
                    <Button type="primary" size="large" icon={<DownloadOutlined />} loading={exporting} onClick={download}>
                        Download CSV
                    </Button>
                </Space>
            </Card>
        </>
    );
}
