import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        minify: true,
        manifest: true,
        rollupOptions: {
            input: {
                main: './main.js', // Relative paths to the project root
                creative: './creative.js',
                typography: './typography.js',
                about: './about.js'
            },
            output: {
                format: 'es',
                entryFileNames: '[name].js', // Use [name] placeholder for dynamic entry file names
                esModule: false,
                compact: true,
                inlineDynamicImports: false, // Ensure this is set to false when using multiple inputs
            }
        }
    }
})
