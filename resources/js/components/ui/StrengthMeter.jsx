import React from 'react';
import { Progress, Typography } from 'antd';
import { passwordStrength } from '../../lib/password';

export default function StrengthMeter({ password }) {
    const strength = passwordStrength(password);
    if (!password) return null;

    return (
        <div className="pv-strength" aria-live="polite">
            <Progress percent={strength.percent} status={strength.status} showInfo={false} size="small" />
            <Typography.Text type="secondary" className="pv-strength-label">
                Strength: <strong>{strength.label}</strong>
            </Typography.Text>
        </div>
    );
}
