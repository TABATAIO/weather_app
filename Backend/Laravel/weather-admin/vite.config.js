import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.js"],
            refresh: true,
        }),
    ],
    server: {
        hmr: {
            host: "localhost",
        },
        watch: {
            usePolling: true,
            interval: 500,
            binaryInterval: 1000,
            ignored: ["**/node_modules/**", "**/vendor/**", "**/storage/**"],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
        assetsDir: "assets",
        chunkSizeWarningLimit: 1000,
        minify: "esbuild",
        sourcemap: false,
        manifest: true,
        emptyOutDir: true,
        // デッドロック問題の修正
        write: true,
        copyPublicDir: true,
        // ファイルロックの回避
        reportCompressedSize: false,
    },
    css: {
        postcss: {},
    },
});
