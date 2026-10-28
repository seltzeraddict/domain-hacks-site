import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// What the built page may load and talk to: its own files, plus the three outside services in src/apis.js.
// Build only: the dev server injects inline styles and a live-reload socket, which this would block.
const contentSecurityPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:", // the background pattern is an inline SVG
  "font-src 'self'",
  "manifest-src 'self'",
  'connect-src https://api.datamuse.com https://data.iana.org https://dns.google',
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

const securityPolicy = {
  name: 'content-security-policy',
  apply: 'build',
  transformIndexHtml: () => [
    { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: contentSecurityPolicy }, injectTo: 'head-prepend' },
  ],
}

export default defineConfig({
  plugins: [vue(), securityPolicy],
})
