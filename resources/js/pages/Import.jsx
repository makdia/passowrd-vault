import React, { useState } from 'react';
import { Alert, App, Button, Card, Result, Space, Table, Typography, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import { vaultApi } from '../api';
import { errorMessage } from '../api/client';

const MAX_ROWS = 1000;
const COLUMNS = ['name', 'type_id', 'folder_name', 'username', 'password', 'url', 'notes'];

function toRows(records) {
    return records.map((record) => {
        const normalized = Object.fromEntries(Object.entries(record).map(([key, value]) => [key.trim().toLowerCase(), typeof value === 'string' ? value.trim() : value]));
        return Object.fromEntries(COLUMNS.map((column) => [column, normalized[column] ?? '']));
    });
}

// "rows.4.name" -> "Line 6: name is required." (header is line 1)
function rowErrors(error) {
    const errors = error?.response?.data?.errors || {};
    return Object.entries(errors).slice(0, 8).map(([key, messages]) => {
        const match = key.match(/^rows\.(\d+)\.(\w+)$/);
        return match ? `Line ${Number(match[1]) + 2}: ${messages[0].replace(/rows\.\d+\./, '')}` : messages[0];
    });
}

export default function Import() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [rows, setRows] = useState([]);
    const [problem, setProblem] = useState('');
    const [serverErrors, setServerErrors] = useState([]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);

    const reset = () => {
        setFile(null);
        setRows([]);
        setProblem('');
        setServerErrors([]);
        setResult(null);
    };

    const parse = (selected) => {
        reset();
        setFile(selected);
        Papa.parse(selected, {
            header: true,
            skipEmptyLines: 'greedy',
            complete: ({ data, meta }) => {
                const headers = (meta.fields || []).map((field) => field.trim().toLowerCase());
                if (!headers.includes('name')) {
                    setProblem('The file needs a "name" column. Use a file exported from Password Vault, or match its columns.');
                } else if (data.length === 0) {
                    setProblem('The file has no rows.');
                } else if (data.length > MAX_ROWS) {
                    setProblem(`The file has ${data.length} rows. Import up to ${MAX_ROWS} at a time.`);
                }
                setRows(toRows(data));
            },
            error: () => setProblem('Could not read this file as CSV.'),
        });
        return false;
    };

    const submit = () => {
        setImporting(true);
        setServerErrors([]);
        vaultApi.importRows(rows)
            .then(setResult)
            .catch((error) => {
                const list = rowErrors(error);
                list.length ? setServerErrors(list) : message.error(errorMessage(error));
            })
            .finally(() => setImporting(false));
    };

    if (result) {
        return (
            <Card>
                <Result
                    status="success"
                    title={`Imported ${result.items} ${result.items === 1 ? 'item' : 'items'}`}
                    subTitle={result.folders_created ? `${result.folders_created} new ${result.folders_created === 1 ? 'folder was' : 'folders were'} created.` : 'Items were added to your existing folders.'}
                    extra={[
                        <Button key="vault" type="primary" onClick={() => navigate('/vault')}>Open vault</Button>,
                        <Button key="again" onClick={reset}>Import another file</Button>,
                    ]}
                />
            </Card>
        );
    }

    return (
        <>
            <PageHeader title="Import" subtitle="Add items from a CSV file. Existing items are kept." />
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card>
                    <Upload.Dragger accept=".csv,text/csv" maxCount={1} showUploadList={false} beforeUpload={parse}>
                        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                        <p className="ant-upload-text">{file ? file.name : 'Click or drop a CSV file here'}</p>
                        <p className="ant-upload-hint">Columns: {COLUMNS.join(', ')}. Only name is required. Folders are matched by name.</p>
                    </Upload.Dragger>
                </Card>

                {problem && <Alert type="error" showIcon message={problem} />}
                {serverErrors.length > 0 && (
                    <Alert type="error" showIcon message="Fix these rows and try again" description={<ul style={{ margin: 0, paddingLeft: 18 }}>{serverErrors.map((e) => <li key={e}>{e}</li>)}</ul>} />
                )}

                {rows.length > 0 && !problem && (
                    <Card
                        title={`Preview: ${rows.length} ${rows.length === 1 ? 'row' : 'rows'}`}
                        extra={<Button type="primary" loading={importing} onClick={submit}>Import {rows.length}</Button>}
                    >
                        <Table
                            size="small"
                            rowKey={(_, index) => index}
                            dataSource={rows.slice(0, 10)}
                            pagination={false}
                            scroll={{ x: true }}
                            columns={[
                                { title: 'Name', dataIndex: 'name' },
                                { title: 'Folder', dataIndex: 'folder_name' },
                                { title: 'Username', dataIndex: 'username' },
                                { title: 'Password', dataIndex: 'password', render: (value) => (value ? '••••••' : '') },
                                { title: 'Website', dataIndex: 'url' },
                            ]}
                        />
                        {rows.length > 10 && <Typography.Text type="secondary">Showing the first 10 rows.</Typography.Text>}
                    </Card>
                )}
            </Space>
        </>
    );
}
