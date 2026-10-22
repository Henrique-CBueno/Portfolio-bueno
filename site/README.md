# site

Portfólio do Henrique Bueno (bueno_dev) em Astro estático. Visual e regras em `../DESIGN.md`; decisões de produto em `../PRODUCT.md`.

Precisa de Node ≥ 22.23.4 (`.nvmrc` aponta pro 24).

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # gera dist/
npx astro check   # tipos
```

## Dados

- `src/dados/`: conteúdo curado (perfil, projetos em destaque, stacks, premiações).
- `src/lib/snapshot.ts`: vídeos e contagens. Com `API_URL` definido no build, lê `GET /snapshot` da API; sem ela, usa `src/dados/exemplo.ts`.
- `PUBLIC_API_URL`: usada no navegador para as contagens ao vivo (SSE em `/stream`) e o formulário (`POST /contato`). Sem ela, as contagens ficam as do build e o formulário pede pra usar o e-mail.

## Animações

`src/scripts/movimento.ts`, com [Motion](https://motion.dev). Sem JS ou com `prefers-reduced-motion`, a página aparece inteira e parada.
