import api from './client';

const data = (response) => response.data.data;

export const authApi = {
    login: (values) => api.post('/auth/login', values).then((r) => r.data),
    register: (values) => api.post('/auth/register', values).then((r) => r.data),
    me: () => api.get('/auth/me').then(data),
    logout: () => api.post('/auth/logout'),
};

export const dashboardApi = {
    get: () => api.get('/dashboard').then(data),
};

export const categoriesApi = {
    list: () => api.get('/categories').then(data),
};

export const foldersApi = {
    list: () => api.get('/folders').then(data),
    create: (values) => api.post('/folders', values).then(data),
    update: (id, values) => api.put(`/folders/${id}`, values).then(data),
    remove: (id) => api.delete(`/folders/${id}`),
};

export const itemsApi = {
    list: (params) => api.get('/items', { params }).then((r) => r.data),
    get: (id) => api.get(`/items/${id}`).then(data),
    create: (values) => api.post('/items', values).then(data),
    update: (id, values) => api.put(`/items/${id}`, values).then(data),
    remove: (id) => api.delete(`/items/${id}`),
};

export const vaultApi = {
    exportCsv: () => api.get('/vault/export', { responseType: 'blob' }).then((r) => r.data),
    importRows: (rows) => api.post('/vault/import', { rows }).then(data),
};
