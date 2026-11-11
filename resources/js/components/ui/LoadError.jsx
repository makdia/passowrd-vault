import React from 'react';
import { Button, Result } from 'antd';
import { errorMessage } from '../../api/client';

export default function LoadError({ error, onRetry }) {
    return (
        <Result
            status="error"
            title="Could not load this page"
            subTitle={errorMessage(error)}
            extra={onRetry && <Button onClick={onRetry}>Try again</Button>}
        />
    );
}
