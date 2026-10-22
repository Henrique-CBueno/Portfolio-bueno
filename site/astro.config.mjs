// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

// As capas dos vídeos vêm da API (API_URL) no build; o Astro baixa e otimiza cada uma,
// então o site publicado não depende da API pra mostrar imagens.
// (lê também o .env.development, que o "npm run dev" usa)
const modo = process.argv.includes('dev') ? 'development' : 'production';
const api = process.env.API_URL ?? loadEnv(modo, process.cwd(), '').API_URL;

// https://astro.build/config
export default defineConfig({
	image: {
		domains: api ? [new URL(api).hostname] : [],
	},
});
