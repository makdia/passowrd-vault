import React, { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../auth/AuthContext';
import { errorMessage } from '../api/client';

export default function SignIn() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const onFinish = (values) => {
        setSubmitting(true);
        setError('');
        signIn(values)
            .then(() => navigate(location.state?.from?.pathname || '/', { replace: true }))
            .catch((e) => setError(errorMessage(e)))
            .finally(() => setSubmitting(false));
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to unlock your vault."
            footer={<>New here? <Link to="/signup">Create an account</Link></>}
        >
            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
            <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
                    <Input prefix={<MailOutlined />} autoComplete="email" autoFocus />
                </Form.Item>
                <Form.Item name="password" label="Master password" rules={[{ required: true, message: 'Enter your password' }]}>
                    <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={submitting}>Log in</Button>
            </Form>
        </AuthLayout>
    );
}
