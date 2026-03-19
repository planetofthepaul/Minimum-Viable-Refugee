import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://minimumviableexpat.com',
  output: 'static',
  build: {
    format: 'file'
  }
});
