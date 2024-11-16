import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: assetInfo => {
                    const folder = assetInfo.name!.split('/').slice(0, -1).join('/')
                    return folder ? `${folder}/[name].[ext]` : `assets/[name].[ext]`
                },
            },
        },
    },
})
