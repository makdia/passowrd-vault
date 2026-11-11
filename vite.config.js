import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/index.jsx'],
            refresh: true,
        }),
        react(),
    ],
    // serviceWorker.js still reads CRA-style env vars.
    define: {
        'process.env.PUBLIC_URL': JSON.stringify(''),
    },
});
