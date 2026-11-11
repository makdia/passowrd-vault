import axios from 'axios';

const TOKEN_KEY = 'pv_token';

// Storage can throw in private windows; the app still works for the session.
function safeStorage(action) {
    try {
        return action(window.localStorage);
    } catch {
        return null;
    }
}

export const tokenStore = {
    get: () => safeStorage((s) => s.getItem(TOKEN_KEY)),
    set: (token) => safeStorage((s) => s.setItem(TOKEN_KEY, token)),
    clear: () => safeStorage((s) => s.removeItem(TOKEN_KEY)),
};

// The old app kept the email as a fake token under these keys.
safeStorage((s) => {
    s.removeItem('token');
    s.removeItem('userId');
});

const api = axios.create({
    baseURL: '/api',
    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

api.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let handleUnauthorized = () => {};
export function onUnauthorized(handler) {
    handleUnauthorized = handler;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            handleUnauthorized();
        }
        return Promise.reject(error);
    },
);

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
    if (!error?.response) {
        return 'Cannot reach the server. Check your connection and try again.';
    }
    const { data, status } = error.response;
    if (data?.errors) {
        return Object.values(data.errors).flat()[0];
    }
    if (status === 429) {
        return 'Too many attempts. Wait a minute and try again.';
    }
    return data?.message || fallback;
}

// Laravel validation errors in the shape antd Form#setFields expects.
export function fieldErrors(error) {
    const errors = error?.response?.data?.errors || {};
    return Object.entries(errors).map(([name, messages]) => ({
        name: name.split('.'),
        errors: messages,
    }));
}

export default api;
