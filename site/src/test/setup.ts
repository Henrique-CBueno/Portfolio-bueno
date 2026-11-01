// Preparação dos testes de componente (Vitest + Testing Library no jsdom).
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
	cleanup();
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

// o jsdom não tem matchMedia; "menos movimento" ligado: os testes não rodam animação
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (consulta: string) => ({
		matches: consulta.includes('reduce'),
		media: consulta,
		onchange: null,
		addEventListener: () => {},
		removeEventListener: () => {},
		addListener: () => {},
		removeListener: () => {},
		dispatchEvent: () => false,
	}),
});
