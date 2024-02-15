import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from "vite-plugin-fs";
import commonjsExternals from 'vite-plugin-commonjs-externals';

const externals = ['path'];
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fs(), commonjsExternals({ externals })],

});
