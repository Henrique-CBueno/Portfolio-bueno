// Padrão do código (npm run lint). Formatação é com o Prettier (npm run format); aqui só regras de código.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
	{ ignores: ['dist', 'dist-ssr', 'test-results', 'playwright-report'] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['src/**/*.{ts,tsx}'],
		languageOptions: { globals: globals.browser },
		plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
		rules: {
			// regras dos hooks (nome com "use", sem hook condicional, dependências do efeito) e as do React Compiler
			...reactHooks.configs['recommended-latest'].rules,
			// o Fast Refresh do Vite só recarrega sem perder estado se o arquivo exporta só componentes
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			// parâmetro ou variável de propósito sem uso: começa com _
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		},
	},
	{
		// o que roda no Node: build, prerender, testes de ponta a ponta
		files: ['prerender.mjs', 'vite.config.ts', 'playwright.config.ts', 'eslint.config.js', 'e2e/**/*.ts'],
		languageOptions: { globals: globals.node },
	},
	// desliga o que conflita com o Prettier: formatação é dele
	prettier,
);
