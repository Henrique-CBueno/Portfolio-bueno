// Padrão das mensagens de commit (conferido pelo gancho commit-msg): Conventional Commits.
//   <tipo>(<escopo opcional>): <o que muda, em inglês, no imperativo>
//   ex.: feat(site): add the light theme   |   fix(api): keep the last repo list on rate limit
// Tipos: feat, fix, docs, refactor, test, build, chore, ci, perf, style, revert. Detalhes no README (Versionamento).
export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// as partes do projeto
		'scope-enum': [2, 'always', ['site', 'api', 'docker', 'keycloak', 'deps']],
		// o assunto pode começar com nome próprio (GitHub, Docker, Hostinger)
		'subject-case': [0],
	},
};
