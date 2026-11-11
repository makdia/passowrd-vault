import React from 'react';
import { Avatar } from 'antd';

const COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#2563eb'];

export default function ItemAvatar({ name = '', size = 36 }) {
    const color = COLORS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLORS.length];
    return (
        <Avatar shape="square" size={size} style={{ backgroundColor: color, flexShrink: 0 }} aria-hidden="true">
            {name.trim()[0]?.toUpperCase() || '?'}
        </Avatar>
    );
}
