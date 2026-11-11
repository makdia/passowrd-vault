import React, { useEffect, useState } from 'react';
import { App, Button, Card, Col, Dropdown, Empty, Form, Input, Modal, Row, Skeleton, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, FolderFilled, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import LoadError from '../components/ui/LoadError';
import useRequest from '../api/useRequest';
import { foldersApi } from '../api';
import { errorMessage, fieldErrors } from '../api/client';
import { activatable } from '../lib/a11y';

function FolderNameModal({ folder, open, onClose, onSaved }) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) form.setFieldsValue({ name: folder?.name || '' });
    }, [open, folder, form]);

    const submit = ({ name }) => {
        setSaving(true);
        (folder ? foldersApi.update(folder.id, { name }) : foldersApi.create({ name }))
            .then(() => {
                message.success(folder ? 'Folder renamed' : 'Folder created');
                onSaved();
            })
            .catch((error) => {
                const fields = fieldErrors(error);
                fields.length ? form.setFields(fields) : message.error(errorMessage(error));
            })
            .finally(() => setSaving(false));
    };

    return (
        <Modal
            open={open}
            title={folder ? 'Rename folder' : 'New folder'}
            okText={folder ? 'Rename' : 'Create'}
            onOk={() => form.submit()}
            okButtonProps={{ loading: saving }}
            onCancel={onClose}
            forceRender
        >
            <Form form={form} layout="vertical" onFinish={submit}>
                <Form.Item name="name" label="Folder name" rules={[{ required: true, whitespace: true, message: 'Enter a name' }]}>
                    <Input maxLength={255} autoFocus />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default function Folders() {
    const { message, modal } = App.useApp();
    const navigate = useNavigate();
    const { data, error, loading, reload } = useRequest(foldersApi.list);
    const [editing, setEditing] = useState({ open: false, folder: null });

    const confirmDelete = (folder) => modal.confirm({
        title: `Delete "${folder.name}"?`,
        content: folder.items_count
            ? `Its ${folder.items_count} ${folder.items_count === 1 ? 'item stays' : 'items stay'} in your vault without a folder.`
            : 'The folder is empty.',
        okText: 'Delete folder',
        okButtonProps: { danger: true },
        onOk: () => foldersApi.remove(folder.id)
            .then(() => {
                message.success('Folder deleted');
                reload();
            })
            .catch((e) => message.error(errorMessage(e))),
    });

    const newButton = <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({ open: true, folder: null })}>New folder</Button>;

    let body;
    if (error) {
        body = <LoadError error={error} onRetry={reload} />;
    } else if (loading && !data) {
        body = <Skeleton active />;
    } else if (data.length === 0) {
        body = <Card><Empty description="Group related items, like Work or Banking, into folders.">{newButton}</Empty></Card>;
    } else {
        body = (
            <Row gutter={[16, 16]}>
                {data.map((folder) => (
                    <Col key={folder.id} xs={24} sm={12} lg={8} xl={6}>
                        <Card hoverable className="pv-folder-card" {...activatable(() => navigate(`/vault?folder=${folder.id}`), `Open folder ${folder.name}`)}>
                            <div className="pv-folder-card-top">
                                <FolderFilled className="pv-folder-icon" />
                                <Dropdown
                                    trigger={['click']}
                                    menu={{
                                        items: [
                                            { key: 'rename', icon: <EditOutlined />, label: 'Rename' },
                                            { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true },
                                        ],
                                        onClick: ({ key, domEvent }) => {
                                            domEvent.stopPropagation();
                                            key === 'rename' ? setEditing({ open: true, folder }) : confirmDelete(folder);
                                        },
                                    }}
                                >
                                    <Button type="text" icon={<MoreOutlined />} aria-label={`Actions for ${folder.name}`} onClick={(e) => e.stopPropagation()} />
                                </Dropdown>
                            </div>
                            <Typography.Title level={5} ellipsis style={{ margin: '12px 0 2px' }}>{folder.name}</Typography.Title>
                            <Typography.Text type="secondary">{folder.items_count} {folder.items_count === 1 ? 'item' : 'items'}</Typography.Text>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }

    return (
        <>
            <PageHeader title="Folders" subtitle="Open a folder to see its items." extra={newButton} />
            {body}
            <FolderNameModal
                open={editing.open}
                folder={editing.folder}
                onClose={() => setEditing({ open: false, folder: null })}
                onSaved={() => {
                    setEditing({ open: false, folder: null });
                    reload();
                }}
            />
        </>
    );
}
