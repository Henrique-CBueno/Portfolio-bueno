# api

API do portfólio (Quarkus). Guarda os vídeos cadastrados no painel `/admin` do site (capas no MinIO),
lê os inscritos do YouTube e os repositórios fixados do GitHub, e entrega tudo pro site:

| Endpoint | Pra quê |
|---|---|
| `GET /snapshot` | Lido no build do site: vídeos (mais novo primeiro), contagens e repositórios fixados. |
| `GET /capas/<id>` | Capa de cada vídeo, servida do MinIO (cache longo: capa nova ganha id novo). |
| `GET /stream` | SSE: evento `contagens` ao conectar e sempre que um número muda. |
| `POST /contato` | Formulário do site → e-mail, com o visitante no "responder para". 3 mensagens por IP a cada 10 min. |
| `/admin-api/*` | Painel: `GET/POST /videos`, `PUT/DELETE /videos/<id>` (multipart com a capa), `GET /categorias`, `GET /contagens`, `PUT /contagens/<instagram\|tiktok>`. Exige token do Keycloak com o papel `admin`. |
| `GET /q/health` | Saúde. |

Toda mudança feita pelo painel roda o `REBUILD_COMANDO` (no Docker: avisa o construtor do site).

## Rodar

Precisa de Java 25.

```sh
./mvnw quarkus:dev          # desenvolvimento, porta 8080 (sobe sem MinIO/Keycloak; o painel é que precisa deles)
./mvnw test                 # testes (MinIO em memória e login simulado)
./mvnw package && java -jar target/quarkus-app/quarkus-run.jar
```

O jeito mais simples de ter tudo junto (API, MinIO, Keycloak e site) é o `docker compose` da raiz.

## Variáveis de ambiente

| Variável | Padrão | O que é |
|---|---|---|
| `PORTA` | `8080` | Porta HTTP. |
| `DADOS` | `./dados` | Onde fica o `snapshot.json` (vídeos, contagens, repositórios). |
| `ORIGENS` | localhost:4321 e henriquebueno.com | Origens liberadas no CORS (o site, que chama a API de outro domínio). |
| `MINIO_URL`, `MINIO_USUARIO`, `MINIO_SENHA` | `http://localhost:9000`, … | MinIO das capas (bucket `capas`, criado sozinho). |
| `KEYCLOAK_URL` | `http://localhost:8180/realms/portfolio` | Realm do Keycloak, pelo endereço interno. |
| `KEYCLOAK_EMISSOR` | `any` | Emissor dos tokens como o navegador vê (ex.: `https://auth.henriquebueno.com/realms/portfolio`). |
| `YOUTUBE_CHAVE` | — | Chave da YouTube Data API v3. Sem ela, o site mostra só o @. |
| `YOUTUBE_CANAL` | `@bueno_dev` | Handle (`@...`) ou id (`UC...`) do canal. |
| `GITHUB_TOKEN` | — | Token só de leitura, pros repositórios fixados (GraphQL). Sem ele, usa a lista copiada no código. |
| `GITHUB_USUARIO` | `Henrique-CBueno` | Perfil do GitHub. |
| `MAIL_MOCK` | `true` | Com `true`, os e-mails do formulário só vão pro log. Em produção: `false`. |
| `MAIL_HOST`, `MAIL_PORTA`, `MAIL_USUARIO`, `MAIL_SENHA` | —, `465` | SMTP (TLS). Na Hostinger: `smtp.hostinger.com`, porta 465, usuário = o e-mail. |
| `CONTATO_PARA`, `CONTATO_DE` | `contato@henriquebueno.com` | Destino e remetente do formulário. |
| `REBUILD_COMANDO` | — | Comando rodado quando o painel muda algo. Saída em `dados/rebuild.log`. |

As categorias dos vídeos (a pill colorida) ficam em `portfolio.categorias`, no `application.properties`.
