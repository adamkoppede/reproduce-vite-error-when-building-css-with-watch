import {defineConfig} from "vite";
import viteLegacyPlugin from "@vitejs/plugin-legacy";

export default defineConfig({
    plugins: [viteLegacyPlugin()],
    build: {
        manifest: true,
        rollupOptions: {
            input: [
                'src/script.ts',
                'src/styles.css'
            ]
        }
    }
})
