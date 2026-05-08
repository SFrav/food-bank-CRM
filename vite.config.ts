import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from 'fs';
import viteDevRuntimeCode from './viteDevRuntimeCode.ts'; //remove after development

const simpleTagger = {
  name: 'simple-tagger',
  enforce: 'pre',
  resolveId(id, importer) {
    if (id === 'react/jsx-dev-runtime' && !importer?.includes('\0simple-tag')) {
      return '\0simple-tag/jsx-dev-runtime';
    }
    return null;
  },
  load(id) {
    if (id === '\0simple-tag/jsx-dev-runtime') return viteDevRuntimeCode;
    return null;
  },
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8081,
    https: {
      key: fs.readFileSync('./.cert/key.pem'),
      cert: fs.readFileSync('./.cert/cert.pem'),
    },  
  },
  plugins: [
    react(), 
    mode === 'development' && simpleTagger, //remove after development
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
