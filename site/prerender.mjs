// Último passo do "npm run build": renderiza cada página (só o que é fixo; os dados da API vêm no navegador):
// / → dist/index.html, /projetos/<slug> → dist/projetos/<slug>.html e o 404 → dist/404.html.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const { dadosDoBuild, montar, paginasDoBuild } = await import('./dist-ssr/entry-server.js');
const dados = dadosDoBuild();

const modelo = await readFile('dist/index.html', 'utf8');
const arquivo = (caminho) => (caminho === '/' ? 'dist/index.html' : `dist${caminho}.html`);
for (const caminho of paginasDoBuild) {
	await mkdir(dirname(arquivo(caminho)), { recursive: true });
	await writeFile(arquivo(caminho), montar(modelo, dados, caminho));
}
await rm('dist-ssr', { recursive: true, force: true });
console.log(`[prerender] ${paginasDoBuild.length} páginas: ${paginasDoBuild.join(', ')}`);
