import React, { useCallback, useMemo, useState } from 'react';
import { App, Button, Card, Empty, Input, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, FolderOutlined, PlusOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import ItemAvatar from '../components/ui/ItemAvatar';
import CopyButton from '../components/ui/CopyButton';
import LoadError from '../components/ui/LoadError';
import SecretCell from '../components/vault/SecretCell';
import ItemFormModal from '../components/vault/ItemFormModal';
import useRequest from '../api/useRequest';
import { categoriesApi, foldersApi, itemsApi } from '../api';
import { errorMessage } from '../api/client';
import { hostOf, timeAgo } from '../lib/format';

const PAGE_SIZE = 20;
const CATEGORY_COLORS = { Login: 'blue', 'Secure Note': 'gold', Card: 'green', Identity: 'purple' };

export default function Vault() {
    const { message } = App.useApp();
    const [params, setParams] = useSearchParams();
    const [searchDraft, setSearchDraft] = useState(params.get('q') || '');

    const query = {
        search: params.get('q') || undefined,
        folder_id: params.get('folder') || undefined,
        category_id: params.get('category') || undefined,
        page: Number(params.get('page')) || 1,
        per_page: PAGE_SIZE,
    };
    const queryKey = JSON.stringify(query);

    const items = useRequest(() => itemsApi.list(query), [queryKey]);
    const folders = useRequest(foldersApi.list);
    const categories = useRequest(categoriesApi.list);

    const editing = params.get('edit');
    const creating = params.get('new') === '1';

    // Filters always restart from page 1.
    const updateParams = useCallback((changes, { resetPage = true } = {}) => {
        setParams((current) => {
            const next = new URLSearchParams(current);
            Object.entries(changes).forEach(([key, value]) => (value === undefined || value === null || value === '' ? next.delete(key) : next.set(key, value)));
            if (resetPage) next.delete('page');
            return next;
        });
    }, [setParams]);

    const closeForm = () => updateParams({ edit: null, new: null }, { resetPage: false });

    const remove = (item) => itemsApi.remove(item.id)
        .then(() => {
            message.success(`"${item.name}" deleted`);
            const onlyRowOnPage = items.data?.data.length === 1 && query.page > 1;
            onlyRowOnPage ? updateParams({ page: query.page - 1 }, { resetPage: false }) : items.reload();
        })
        .catch((error) => message.error(errorMessage(error)));

    const folderOptions = useMemo(() => [
        { value: '', label: 'All folders' },
        { value: 'none', label: 'No folder' },
        ...(folders.data || []).map((f) => ({ value: String(f.id), label: `${f.name} (${f.items_count})` })),
    ], [folders.data]);

    const categoryOptions = useMemo(() => [
        { value: '', label: 'All types' },
        ...(categories.data || []).map((c) => ({ value: String(c.id), label: c.name })),
    ], [categories.data]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (name, item) => (
                <div className="pv-item-name">
                    <ItemAvatar name={name} />
                    <div className="pv-item-name-text">
                        <Typography.Text strong>{name}</Typography.Text>
                        {item.url && (
                            <a href={item.url.includes('://') ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                {hostOf(item.url)}
                            </a>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            responsive: ['md'],
            render: (username) => (username ? (
                <Space size={4}>
                    <Typography.Text ellipsis style={{ maxWidth: 180 }}>{username}</Typography.Text>
                    <CopyButton text={username} label="Copy username" successMessage="Username copied" />
                </Space>
            ) : <Typography.Text type="secondary">—</Typography.Text>),
        },
        {
            title: 'Password',
            key: 'password',
            render: (_, item) => <div onClick={(e) => e.stopPropagation()}><SecretCell item={item} /></div>,
        },
        {
            title: 'Labels',
            key: 'labels',
            responsive: ['lg'],
            render: (_, item) => (
                <Space size={4} wrap>
                    {item.category && <Tag color={CATEGORY_COLORS[item.category] || 'default'}>{item.category}</Tag>}
                    {item.folder && <Tag icon={<FolderOutlined />}>{item.folder}</Tag>}
                </Space>
            ),
        },
        {
            title: 'Updated',
            dataIndex: 'updated_at',
            responsive: ['xl'],
            render: (value) => <Typography.Text type="secondary">{timeAgo(value)}</Typography.Text>,
        },
        {
            title: <span className="sr-only">Actions</span>,
            key: 'actions',
            align: 'right',
            render: (_, item) => (
                <Space size={0} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Edit">
                        <Button type="text" icon={<EditOutlined />} aria-label={`Edit ${item.name}`} onClick={() => updateParams({ edit: item.id }, { resetPage: false })} />
                    </Tooltip>
                    <Popconfirm
                        title={`Delete "${item.name}"?`}
                        description="This can't be undone."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => remove(item)}
                    >
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} aria-label={`Delete ${item.name}`} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const hasFilters = Boolean(query.search || query.folder_id || query.category_id);
    const meta = items.data?.meta;

    return (
        <>
            <PageHeader
                title="Vault"
                subtitle={meta ? `${meta.total} ${meta.total === 1 ? 'item' : 'items'}` : 'Your saved logins, notes and cards'}
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => updateParams({ new: 1 }, { resetPage: false })}>New item</Button>}
            />

            <div className="pv-toolbar">
                <Input.Search
                    allowClear
                    placeholder="Search name, username or website"
                    aria-label="Search the vault"
                    value={searchDraft}
                    onChange={(e) => {
                        setSearchDraft(e.target.value);
                        if (!e.target.value) updateParams({ q: null });
                    }}
                    onSearch={(value) => updateParams({ q: value.trim() })}
                />
                <Select aria-label="Filter by folder" value={params.get('folder') || ''} options={folderOptions} onChange={(value) => updateParams({ folder: value })} />
                <Select aria-label="Filter by type" value={params.get('category') || ''} options={categoryOptions} onChange={(value) => updateParams({ category: value })} />
            </div>

            {items.error ? <LoadError error={items.error} onRetry={items.reload} /> : (
                <Card className="pv-table-card">
                    <Table
                        rowKey="id"
                        columns={columns}
                        scroll={{ x: 'max-content' }}
                        dataSource={items.data?.data || []}
                        loading={items.loading}
                        onRow={(item) => ({ onClick: () => updateParams({ edit: item.id }, { resetPage: false }) })}
                        locale={{
                            emptyText: (
                                <Empty description={hasFilters ? 'No items match these filters' : 'Your vault is empty'}>
                                    {hasFilters
                                        ? <Button onClick={() => { setSearchDraft(''); updateParams({ q: null, folder: null, category: null }); }}>Clear filters</Button>
                                        : <Button type="primary" icon={<PlusOutlined />} onClick={() => updateParams({ new: 1 }, { resetPage: false })}>Add your first item</Button>}
                                </Empty>
                            ),
                        }}
                        pagination={meta && meta.total > PAGE_SIZE ? {
                            current: meta.current_page,
                            pageSize: PAGE_SIZE,
                            total: meta.total,
                            showSizeChanger: false,
                            onChange: (page) => updateParams({ page }, { resetPage: false }),
                        } : false}
                    />
                </Card>
            )}

            <ItemFormModal
                open={creating || Boolean(editing)}
                itemId={editing ? Number(editing) : null}
                defaults={{
                    folder_id: query.folder_id && query.folder_id !== 'none' ? Number(query.folder_id) : null,
                    ...(query.category_id ? { category_id: Number(query.category_id) } : {}),
                }}
                folders={folders.data || []}
                categories={categories.data || []}
                onClose={closeForm}
                onSaved={() => {
                    closeForm();
                    items.reload();
                    folders.reload();
                }}
            />
        </>
    );
}
