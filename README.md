# Portfólio · Henrique Bueno

Site (`site/`, React + Vite, pré-renderizado no build) e API (`api/`, Quarkus) do portfólio. Decisões de produto em `PRODUCT.md`, visual em `DESIGN.md`.

## Rodar com Docker (na sua máquina)

```sh
cp .env.example .env      # preencha pelo menos MINIO_SENHA e KEYCLOAK_ADMIN_SENHA
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

| Endereço | O quê |
|---|---|
| http://localhost:8080 | site (e o painel em `/admin`) |
| http://localhost:8082 | API |
| http://localhost:8180 | Keycloak (console em `/admin`) |

O `docker-compose.local.yml` só publica essas portas; no servidor quem cuida disso é o Coolify.

| Serviço | O que faz |
|---|---|
| `web` | Nginx servindo só o site estático (arquivos). |
| `construtor` | Faz o build do site lendo a API e publica no volume `site`. Quando o painel muda algo, a API toca `/dados/rebuild-pedido` e ele refaz o build (o site no ar só troca quando o build novo termina; se falhar, fica o anterior). |
| `api` | Quarkus, só a API: vídeos e números do painel, YouTube, GitHub, formulário e SSE. Detalhes em `api/README.md`. |
| `minio` | Guarda as capas dos vídeos (imagem do MinIO mantida pelo Coolify; a oficial não é mais publicada). Só na rede interna. |
| `keycloak` | Login do painel `/admin`. Importa o realm `portfolio` (papel `admin` e o client do painel) na primeira subida. |

```sh
docker compose logs -f construtor                    # acompanhar os builds do site
docker compose exec api touch /dados/rebuild-pedido  # forçar um rebuild
```

## Painel `/admin`

1. Abra o console do Keycloak (`${KEYCLOAK_URL_PUBLICA}/admin`), entre com `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_SENHA` e troque pro realm **portfolio**.
2. **Users → Create new user** (seu usuário e e-mail) → aba **Credentials → Set password** (desmarque *Temporary*).
3. Aba **Role mapping → Assign role → admin**.
4. Entre em `${SITE_URL}/admin`: cadastre vídeos (capa, título, categoria, data e links) e os números do Instagram e do TikTok. O site se atualiza sozinho em alguns segundos.

O Keycloak roda em modo `start-dev` (banco H2 no volume `keycloak`): serve pro começo, mas o ideal em produção é `start` com Postgres e restringir o console de administração.

## Deploy no Coolify

1. Suba o repositório pro GitHub (pode ser privado).
2. No Coolify: **New Resource → repositório (GitHub App ou deploy key) → Build Pack: Docker Compose**, arquivo `/docker-compose.yml`.
3. Em **Domains**, um domínio por serviço (o Coolify cuida do HTTPS):
   - `web` → `https://henriquebueno.com` (porta 80)
   - `api` → `https://api.henriquebueno.com:8080`
   - `keycloak` → `https://auth.henriquebueno.com:8080`
4. Em **Environment Variables**:
   - `SITE_URL=https://henriquebueno.com`, `API_URL_PUBLICA=https://api.henriquebueno.com`, `KEYCLOAK_URL_PUBLICA=https://auth.henriquebueno.com` (obrigatórias)
   - `ORIGENS=https://henriquebueno.com,https://www.henriquebueno.com` (se usar www)
   - `MINIO_SENHA` e `KEYCLOAK_ADMIN_SENHA` (obrigatórias, invente senhas longas)
   - `YOUTUBE_CHAVE`, `GITHUB_TOKEN`
   - `MAIL_MOCK=false`, `MAIL_USUARIO`, `MAIL_SENHA` (SMTP da Hostinger: `smtp.hostinger.com`, porta 465)
5. **Deploy.** Os volumes (`dados`, `site`, `minio`, `keycloak`) ficam entre deploys: vídeos, capas e usuários não se perdem.
6. Crie seu usuário no Keycloak (veja **Painel `/admin`** acima).
7. No DNS, aponte `henriquebueno.com`, `api.henriquebueno.com` e `auth.henriquebueno.com` (registros A) pro IP da VPS.

A API só confia no `X-Forwarded-For` vindo de rede privada (o proxy do Coolify), então o limite do formulário conta por visitante.
