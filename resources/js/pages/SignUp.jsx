import React, { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import StrengthMeter from '../components/ui/StrengthMeter';
import { useAuth } from '../auth/AuthContext';
import { errorMessage, fieldErrors } from '../api/client';

export default function SignUp() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const password = Form.useWatch('password', form);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const onFinish = (values) => {
        setSubmitting(true);
        setError('');
        signUp(values)
            .then(() => navigate('/', { replace: true }))
            .catch((e) => {
                const fields = fieldErrors(e);
                fields.length ? form.setFields(fields) : setError(errorMessage(e));
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <AuthLayout
            title="Create your vault"
            subtitle="Your master password unlocks everything, so make it long and memorable."
            footer={<>Already have an account? <Link to="/login">Log in</Link></>}
        >
            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
                <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter your name' }]}>
                    <Input prefix={<UserOutlined />} autoComplete="name" autoFocus />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                    <Input prefix={<MailOutlined />} autoComplete="email" />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Master password"
                    extra={<StrengthMeter password={password} />}
                    rules={[{ required: true, min: 8, message: 'Use at least 8 characters' }]}
                >
                    <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
                </Form.Item>
                <Form.Item
                    name="password_confirmation"
                    label="Confirm master password"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Confirm your password' },
                        ({ getFieldValue }) => ({
                            validator: (_, value) => (!value || getFieldValue('password') === value
                                ? Promise.resolve()
                                : Promise.reject(new Error('Passwords do not match'))),
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={submitting}>Create account</Button>
            </Form>
        </AuthLayout>
    );
}
