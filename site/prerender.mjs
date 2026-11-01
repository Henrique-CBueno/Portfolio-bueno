// Último passo do "npm run build": renderiza a página com o snapshot da API (ou os dados de exemplo)
// e grava em dist/index.html. As capas dos vídeos são baixadas da API e convertidas pra WebP aqui,
// então o site publicado não depende da API pra mostrar imagens.
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const { carregarDados, montar } = await import('./dist-ssr/entry-server.js');
const dados = await carregarDados();

const larguras = [300, 540];
await mkdir('dist/capas', { recursive: true });
dados.snapshot.videos = await Promise.all(
	dados.snapshot.videos.map(async (video) => {
		if (typeof video.capa !== 'string') return video;
		const resposta = await fetch(video.capa);
		if (!resposta.ok) throw new Error(`capa ${video.capa}: API respondeu ${resposta.status}`);
		const original = Buffer.from(await resposta.arrayBuffer());
		const nome = createHash('sha1').update(video.capa).digest('hex').slice(0, 12);
		const saidas = await Promise.all(
			larguras.map(async (largura) => {
				const { data, info } = await sharp(original).resize({ width: largura, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
				const caminho = `/capas/${nome}-${largura}.webp`;
				await writeFile(`dist${caminho}`, data);
				return { caminho, info };
			}),
		);
		const maior = saidas.at(-1);
		return {
			...video,
			capa: {
				src: maior.caminho,
				srcset: saidas.map((s) => `${s.caminho} ${s.info.width}w`).join(', '),
				width: maior.info.width,
				height: maior.info.height,
			},
		};
	}),
);

// imagens que só o build do servidor gerou (ex.: capas dos dados de exemplo)
await cp('dist-ssr/assets', 'dist/assets', { recursive: true, force: false, filter: (origem) => !origem.endsWith('.css') }).catch((erro) => {
	if (erro.code !== 'ENOENT') throw erro;
});

const modelo = await readFile('dist/index.html', 'utf8');
await writeFile('dist/index.html', montar(modelo, dados));
await rm('dist-ssr', { recursive: true, force: true });
console.log(`[prerender] dist/index.html com ${dados.snapshot.videos.length} vídeo(s)`);
