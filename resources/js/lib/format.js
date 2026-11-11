const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const STEPS = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
];

export function timeAgo(value) {
    if (!value) return '';
    const seconds = (new Date(value).getTime() - Date.now()) / 1000;
    for (const [unit, size] of STEPS) {
        if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
    }
    return 'just now';
}

export function hostOf(url) {
    if (!url) return '';
    try {
        return new URL(url.includes('://') ? url : `https://${url}`).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export function downloadBlob(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
