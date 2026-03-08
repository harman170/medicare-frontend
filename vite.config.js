import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default {
    plugins: [react()],
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    },
    server: {
        hmr: {
            clientPort: 5173, // Force WebSocket port
            protocol: 'ws' // Ensure WebSocket protocol
        }
    }
}