import React, { useEffect, useState } from 'react';
import { App, Button, Col, Form, Input, Modal, Row, Select, Spin, Tooltip } from 'antd';
import { GlobalOutlined, LockOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
import StrengthMeter from '../ui/StrengthMeter';
import { itemsApi } from '../../api';
import { errorMessage, fieldErrors } from '../../api/client';
import { generatePassword } from '../../lib/password';

const EMPTY = { category_id: 1, name: '', folder_id: null, username: '', password: '', url: '', notes: '' };

export default function ItemFormModal({ open, itemId, defaults, folders, categories, onClose, onSaved }) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const password = Form.useWatch('password', form);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const isEdit = Boolean(itemId);

    useEffect(() => {
        if (!open) return;
        form.resetFields();
        if (!isEdit) {
            form.setFieldsValue({ ...EMPTY, ...defaults });
            return;
        }
        let active = true;
        setLoading(true);
        itemsApi.get(itemId)
            .then((item) => active && form.setFieldsValue(item))
            .catch((error) => {
                if (!active) return;
                message.error(errorMessage(error));
                onClose();
            })
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, itemId]);

    const submit = (values) => {
        const payload = { ...values, folder_id: values.folder_id ?? null, category_id: values.category_id ?? null };
        setSaving(true);
        (isEdit ? itemsApi.update(itemId, payload) : itemsApi.create(payload))
            .then((item) => {
                message.success(isEdit ? 'Item updated' : 'Item saved');
                onSaved(item);
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
            title={isEdit ? 'Edit item' : 'New item'}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={isEdit ? 'Save changes' : 'Save item'}
            okButtonProps={{ loading: saving, disabled: loading }}
            width={640}
            forceRender
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical" onFinish={submit} requiredMark="optional">
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, message: 'Give this item a name' }]}>
                                <Input placeholder="e.g. GitHub" autoFocus maxLength={255} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="category_id" label="Type">
                                <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="username" label="Username or email">
                                <Input prefix={<UserOutlined />} autoComplete="off" maxLength={255} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item label="Password" htmlFor="password" extra={<StrengthMeter password={password} />}>
                                <div className="pv-password-field">
                                    <Form.Item name="password" noStyle>
                                        <Input.Password prefix={<LockOutlined />} autoComplete="new-password" className="pv-mono" />
                                    </Form.Item>
                                    <Tooltip title="Generate a strong password">
                                        <Button
                                            icon={<ThunderboltOutlined />}
                                            aria-label="Generate a strong password"
                                            onClick={() => form.setFieldValue('password', generatePassword())}
                                        />
                                    </Tooltip>
                                </div>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="url" label="Website">
                                <Input prefix={<GlobalOutlined />} placeholder="https://" maxLength={255} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="folder_id" label="Folder">
                                <Select allowClear placeholder="No folder" options={folders.map((f) => ({ value: f.id, label: f.name }))} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="notes" label="Notes">
                                <Input.TextArea rows={3} maxLength={10000} showCount />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
}
