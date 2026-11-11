import React from 'react';
import { Button, Card, Col, Empty, List, Progress, Row, Skeleton, Space, Statistic, Tag, Typography } from 'antd';
import { FolderOutlined, KeyOutlined, PlusOutlined, SafetyOutlined, WarningOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import ItemAvatar from '../components/ui/ItemAvatar';
import LoadError from '../components/ui/LoadError';
import useRequest from '../api/useRequest';
import { dashboardApi } from '../api';
import { useAuth } from '../auth/AuthContext';
import { hostOf, timeAgo } from '../lib/format';

function scoreColor(score) {
    if (score >= 80) return '#16a34a';
    if (score >= 50) return '#d97706';
    return '#dc2626';
}

function AttentionList({ health }) {
    const navigate = useNavigate();
    const rows = [
        ...health.weak_items.map((item) => ({ ...item, reason: 'Weak', color: 'red' })),
        ...health.reused_items.map((item) => ({ ...item, reason: 'Reused', color: 'orange' })),
    ];

    if (rows.length === 0) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No weak or reused passwords. Nice work." />;
    }

    return (
        <List
            size="small"
            dataSource={rows}
            renderItem={(row) => (
                <List.Item
                    actions={[<Button key="fix" size="small" onClick={() => navigate(`/vault?edit=${row.id}`)}>Fix</Button>]}
                >
                    <Space>
                        <ItemAvatar name={row.name} size={28} />
                        <span>{row.name}</span>
                        <Tag color={row.color}>{row.reason}</Tag>
                    </Space>
                </List.Item>
            )}
        />
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data, error, loading, reload } = useRequest(dashboardApi.get);

    if (error) return <LoadError error={error} onRetry={reload} />;

    const addButton = (
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/vault?new=1')}>New item</Button>
    );

    return (
        <>
            <PageHeader title={`Hi, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="Here is how your vault looks today." extra={addButton} />
            {loading && !data ? <Skeleton active paragraph={{ rows: 8 }} /> : (
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card><Statistic title="Items" value={data.items} prefix={<KeyOutlined />} /></Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card><Statistic title="Folders" value={data.folders} prefix={<FolderOutlined />} /></Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card><Statistic title="Weak passwords" value={data.health.weak} prefix={<WarningOutlined />} valueStyle={data.health.weak ? { color: '#dc2626' } : undefined} /></Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card><Statistic title="Reused passwords" value={data.health.reused} prefix={<SafetyOutlined />} valueStyle={data.health.reused ? { color: '#d97706' } : undefined} /></Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Security score" style={{ height: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                                <Progress
                                    type="dashboard"
                                    percent={data.health.score}
                                    strokeColor={scoreColor(data.health.score)}
                                    format={(value) => <span style={{ fontSize: 28, fontWeight: 600 }}>{value}</span>}
                                />
                                <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
                                    Share of passwords that are strong and not reused.
                                </Typography.Paragraph>
                            </div>
                            <List
                                size="small"
                                dataSource={data.categories}
                                renderItem={(category) => (
                                    <List.Item>
                                        <span>{category.name}</span>
                                        <Link to={`/vault?category=${category.id}`}>{category.count}</Link>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Needs attention" style={{ height: '100%' }}>
                            <AttentionList health={data.health} />
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Recently updated" extra={<Link to="/vault">View all</Link>} style={{ height: '100%' }}>
                            {data.recent.length === 0 ? (
                                <Empty description="Your vault is empty">{addButton}</Empty>
                            ) : (
                                <List
                                    size="small"
                                    dataSource={data.recent}
                                    renderItem={(item) => (
                                        <List.Item onClick={() => navigate(`/vault?edit=${item.id}`)} style={{ cursor: 'pointer' }}>
                                            <List.Item.Meta
                                                avatar={<ItemAvatar name={item.name} size={32} />}
                                                title={item.name}
                                                description={hostOf(item.url) || item.username || item.category}
                                            />
                                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>{timeAgo(item.updated_at)}</Typography.Text>
                                        </List.Item>
                                    )}
                                />
                            )}
                        </Card>
                    </Col>
                </Row>
            )}
        </>
    );
}
