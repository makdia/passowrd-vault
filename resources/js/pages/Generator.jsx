import React, { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Checkbox, Col, InputNumber, List, Row, Slider, Space, Typography } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import PageHeader from '../components/ui/PageHeader';
import StrengthMeter from '../components/ui/StrengthMeter';
import { DEFAULT_GENERATOR_OPTIONS, generatePassword } from '../lib/password';
import { copyText } from '../lib/clipboard';

const SETS = [
    { key: 'uppercase', label: 'Uppercase (A-Z)' },
    { key: 'lowercase', label: 'Lowercase (a-z)' },
    { key: 'numbers', label: 'Numbers (0-9)' },
    { key: 'symbols', label: 'Symbols (!@#$)' },
];
const HISTORY_SIZE = 5;

export default function Generator() {
    const { message } = App.useApp();
    const [options, setOptions] = useState(DEFAULT_GENERATOR_OPTIONS);
    const [password, setPassword] = useState('');
    const [history, setHistory] = useState([]);
    const noSetChosen = !SETS.some(({ key }) => options[key]);

    const regenerate = useCallback(() => {
        const next = generatePassword(options);
        setPassword(next);
        if (next) setHistory((previous) => [next, ...previous].slice(0, HISTORY_SIZE));
    }, [options]);

    useEffect(regenerate, [regenerate]);

    const copy = (value) => copyText(value)
        .then(() => message.success('Password copied'))
        .catch(() => message.error('Your browser blocked the copy'));

    const setOption = (key, value) => setOptions((previous) => ({ ...previous, [key]: value }));

    return (
        <>
            <PageHeader title="Password generator" subtitle="Random passwords from your browser's secure random source. Nothing is sent to the server." />
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={15}>
                    <Card>
                        <div className="pv-generated" aria-live="polite">
                            <Typography.Text className="pv-mono pv-generated-text" copyable={false}>
                                {password || 'Pick at least one character set'}
                            </Typography.Text>
                        </div>
                        <StrengthMeter password={password} />
                        <Space style={{ marginTop: 16 }} wrap>
                            <Button type="primary" icon={<CopyOutlined />} onClick={() => copy(password)} disabled={!password}>Copy</Button>
                            <Button icon={<ReloadOutlined />} onClick={regenerate} disabled={noSetChosen}>Regenerate</Button>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} lg={9}>
                    <Card title="Options">
                        <Typography.Text strong id="pv-length-label">Length</Typography.Text>
                        <Row gutter={12} align="middle">
                            <Col flex="auto">
                                <Slider min={8} max={64} value={options.length} onChange={(value) => setOption('length', value)} aria-labelledby="pv-length-label" />
                            </Col>
                            <Col>
                                <InputNumber min={8} max={64} value={options.length} onChange={(value) => value && setOption('length', value)} aria-label="Password length" style={{ width: 72 }} />
                            </Col>
                        </Row>
                        <Space direction="vertical" style={{ marginTop: 8 }}>
                            {SETS.map(({ key, label }) => (
                                <Checkbox key={key} checked={options[key]} onChange={(e) => setOption(key, e.target.checked)}>{label}</Checkbox>
                            ))}
                            <Checkbox checked={options.excludeAmbiguous} onChange={(e) => setOption('excludeAmbiguous', e.target.checked)}>
                                Avoid look-alikes (0 O l 1 I |)
                            </Checkbox>
                        </Space>
                        {noSetChosen && <Typography.Paragraph type="danger" style={{ marginTop: 12 }}>Choose at least one character set.</Typography.Paragraph>}
                    </Card>
                </Col>
                {history.length > 1 && (
                    <Col span={24}>
                        <Card title="Recent (this page only)">
                            <List
                                size="small"
                                dataSource={history.slice(1)}
                                renderItem={(value) => (
                                    <List.Item actions={[<Button key="copy" type="text" size="small" icon={<CopyOutlined />} aria-label="Copy this password" onClick={() => copy(value)} />]}>
                                        <Typography.Text className="pv-mono" ellipsis>{value}</Typography.Text>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                )}
            </Row>
        </>
    );
}
