import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// export default defineConfig({
//     plugins: [react()],
// })

export default defineConfig({
    plugins: [react()],
    server: {
        hmr: {
            clientPort: 5173, // Force WebSocket port
            protocol: 'ws' // Ensure WebSocket protocol
        }
    }
});