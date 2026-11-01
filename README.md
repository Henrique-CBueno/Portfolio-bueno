# Portfólio · Henrique Bueno

Site (`site/`, React + Vite, estático, na hospedagem da Hostinger) e backend (`api/` em Quarkus, MinIO e Keycloak, no Docker da VPS pelo Coolify). Decisões de produto em `PRODUCT.md`, visual em `DESIGN.md`.

O site é só arquivo estático: as partes fixas (sobre, projetos, stacks, prêmios, páginas de projeto, 404) vêm prontas no HTML, e os vídeos, seguidores e repositórios fixados o navegador busca na API a cada visita (com esqueleto enquanto carrega, erro com "tentar de novo" e lista vazia). Reel novo aparece sozinho; o site só precisa ser publicado de novo quando muda o código ou os textos.

## Rodar na sua máquina

Backend (API, MinIO e Keycloak) no Docker:

```sh
cp .env.example .env      # preencha pelo menos MINIO_SENHA e KEYCLOAK_ADMIN_SENHA
docker compose -p portfolio -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Site, com o Node 24 (`.nvmrc`):

```sh
cd site
npm install
npm run dev               # http://localhost:4321 (o painel em /admin), usando a API local (site/.env.development)
```

| Endereço | O quê |
|---|---|
| http://localhost:4321 | site (`npm run dev`) e o painel em `/admin` |
| http://localhost:8082 | API |
| http://localhost:8180 | Keycloak (console em `/admin`) |

O `docker-compose.local.yml` só publica essas portas; no servidor quem cuida disso é o Coolify.

| Serviço | O que faz |
|---|---|
| `api` | Quarkus, só a API: Reels e seguidores do Instagram, YouTube, GitHub, números do painel, formulário e SSE. Detalhes em `api/README.md`. |
| `minio` | Guarda as capas dos vídeos (imagem do MinIO mantida pelo Coolify; a oficial não é mais publicada). Só na rede interna. |
| `keycloak` | Login do painel `/admin`. Importa o realm `portfolio` (papel `admin` e o client do painel) na primeira subida. |

## Painel `/admin`

1. Abra o console do Keycloak (`${KEYCLOAK_URL_PUBLICA}/admin`), entre com `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_SENHA` e troque pro realm **portfolio**.
2. **Users → Create new user** (seu usuário e e-mail) → aba **Credentials → Set password** (desmarque *Temporary*).
3. Aba **Role mapping → Assign role → admin**.
4. Entre em `${SITE_URL}/admin` pra digitar o número de seguidores do Instagram, se não tiver `META_API_KEY` (o TikTok mostra só o @, sem número).

Os vídeos vêm dos Reels do Instagram (com `META_API_KEY`), lidos a cada 5 min: o título é a primeira linha da legenda e a categoria, a hashtag (`#resiliencia`, `#concorrencia`, `#consistencia`, `#seguranca`, `#arquitetura`, com ou sem acento). Reel novo, editado ou apagado aparece no site em até uns 5 minutos, sem publicar nada.

O Keycloak roda em modo `start-dev` (banco H2 no volume `keycloak`): serve pro começo, mas o ideal em produção é `start` com Postgres e restringir o console de administração.

## Código do site: estrutura e convenções

```
site/src/
  paginas/      uma página por rota (Inicio, Projeto, NaoEncontrada): monta as seções
  components/   peças visuais: só aparência; cada uma com seu .css ao lado (Topo.tsx + Topo.css)
  hooks/        lógica e estado das telas (useSnapshot, useFormularioContato, useMensagens…)
  services/     tudo que fala com fora: API pública (api.ts), login (autenticacao.ts), API do painel (painel.ts)
  lib/          funções puras e tipos, sem React e sem rede (validação do contato, formatos, tema)
  dados/        conteúdo curado à mão (perfil, projetos, prêmios, stacks)
  admin/        telas do painel /admin e a entrada dele
  scripts/      animações (Motion) e cursor, que mexem direto no DOM
  styles/       tokens de cor e base (global.css)
site/e2e/       testes de ponta a ponta (Playwright)
```

**Quem chama quem:** componente → hook → service. Componente visual não chama `fetch` nem o Keycloak: pede a um hook,
e o hook usa uma função de `services/`. Regra pura (validar, formatar) fica em `lib/`, onde é testada sem React.

**Nomes** (o código é em português, a língua do domínio; só nomes de bibliotecas ficam em inglês):
- componentes e tipos em PascalCase: `Topo.tsx` exporta `Topo`, `Carga<T>`, `Recebida`;
- hooks começam com `use`, em camelCase: `useMensagens.ts` exporta `useMensagens`;
- funções e variáveis em camelCase, com verbo nas ações: `listarMensagens`, `enviarContato`, `aplicarTema`;
- constantes de módulo em MAIÚSCULAS: `MAXIMO_DESTAQUES`, `MINIMO_MENSAGEM`;
- classes CSS em minúsculas, aninhadas na classe raiz do componente (`.topo { .marca { … } }`);
- testes ao lado do arquivo (`contato.test.ts`, `Contato.test.tsx`); de ponta a ponta em `e2e/*.spec.ts`.

**Peças reaproveitadas:** todo botão é `<Botao>` e todo card é `<Card>`; cor só por token (`var(--…)` do `global.css`).

**Padrão verificado:** ESLint (TypeScript + regras dos hooks do React) e Prettier (tabs, aspas simples, 160 colunas).
Antes de cada commit que mexe em `site/`, o Husky roda o lint-staged (lint e formatação corrigidos nos arquivos do
commit; erro de lint barra o commit) e a checagem de tipos. O CSS fica fora do Prettier: uma regra por linha é
convenção do projeto.

```sh
cd site
npm run lint            # ESLint
npm run format          # Prettier (npm run format:check só confere)
npm run check           # TypeScript
```

O gancho é instalado pelo `npm install` (script `prepare`).

## Testes

```sh
cd site
npm test             # regras e componentes (Vitest + Testing Library): validação do formulário, login e bloqueio do painel
npm run test:e2e     # ponta a ponta no Chrome (Playwright), desktop e celular, sobre o build de produção
cd ../api
./mvnw test          # API: validação do /contato, bloqueio do /admin-api (401/403), fontes, mensagens, destaques
```

Os testes de ponta a ponta simulam a API e o Keycloak, então não precisam do Docker. Usam o Chrome instalado;
numa máquina sem ele (ex.: CI), rode antes `npx playwright install chrome`.

## Deploy

São duas partes: o backend na VPS (Coolify) e o site estático na Hostinger. O site chama o backend pelos domínios públicos.

### Backend no Coolify (VPS)

1. Suba o repositório pro GitHub (pode ser privado).
2. No Coolify: **New Resource → repositório (GitHub App ou deploy key) → Build Pack: Docker Compose**, arquivo `/docker-compose.yml`.
3. Em **Domains**, um domínio por serviço (o Coolify cuida do HTTPS):
   - `api` → `https://api.henriquebueno.com:8080`
   - `keycloak` → `https://auth.henriquebueno.com:8080`
4. Em **Environment Variables**:
   - `SITE_URL=https://henriquebueno.com`, `API_URL_PUBLICA=https://api.henriquebueno.com`, `KEYCLOAK_URL_PUBLICA=https://auth.henriquebueno.com` (obrigatórias)
   - `ORIGENS=https://henriquebueno.com,https://www.henriquebueno.com` (se usar www)
   - `MINIO_SENHA` e `KEYCLOAK_ADMIN_SENHA` (obrigatórias, invente senhas longas)
   - `YOUTUBE_CHAVE`, `GITHUB_TOKEN`, `META_API_KEY`
   - `MAIL_MOCK=false`, `MAIL_USUARIO`, `MAIL_SENHA` (SMTP da Hostinger: `smtp.hostinger.com`, porta 465)
5. **Deploy.** Os volumes (`dados`, `minio`, `keycloak`) ficam entre deploys: vídeos, capas, o token renovado da Meta e usuários não se perdem.
6. Crie seu usuário no Keycloak (veja **Painel `/admin`** acima).
7. No DNS, aponte `api.henriquebueno.com` e `auth.henriquebueno.com` (registros A) pro IP da VPS.

### Site na Hostinger

1. Gere o site na sua máquina (os endereços da API e do Keycloak vêm do `site/.env.production`):
   ```sh
   cd site
   npm ci
   npm run build             # sai tudo em site/dist
   ```
2. No hPanel da Hostinger, **Arquivos → Gerenciador de arquivos → `public_html`**: apague o que tiver lá e envie **o conteúdo** de `site/dist` (não a pasta). O jeito mais fácil é compactar o conteúdo num `.zip`, enviar e extrair lá. Por FTP também serve.
3. Confira que os arquivos `.htaccess` foram junto (na raiz e em `admin/`). Eles começam com ponto e alguns programas escondem. São eles que fazem `/projetos/revi`, o F5 e a página 404 funcionarem.
4. Em **Segurança → SSL**, ative o certificado e o **Forçar HTTPS**.
5. O domínio `henriquebueno.com` aponta pra Hostinger (o padrão se ele foi registrado lá); só os subdomínios `api.` e `auth.` vão pra VPS.

Publique de novo (passos 1 a 3) quando mudar código, textos ou imagens do site. Vídeos, seguidores e repositórios não precisam: o navegador busca na API.

A API só confia no `X-Forwarded-For` vindo de rede privada (o proxy do Coolify), então o limite do formulário conta por visitante.
