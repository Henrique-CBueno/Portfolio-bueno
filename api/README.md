# api

API do portfólio (Quarkus). Lê os Reels e os seguidores do Instagram (capas copiadas pro MinIO),
os inscritos do YouTube e os repositórios fixados do GitHub, guarda o número digitado no painel
`/admin` do site (Instagram sem token), e entrega tudo pro site:

| Endpoint | Pra quê |
|---|---|
| `GET /snapshot` | Lido no build do site: vídeos (mais novo primeiro), contagens e repositórios fixados. |
| `GET /capas/<id>` | Capa de cada vídeo, servida do MinIO (cache longo: capa nova ganha id novo). |
| `GET /stream` | SSE: evento `contagens` ao conectar e sempre que um número muda. |
| `POST /contato` | Formulário do site → e-mail, com o visitante no "responder para". 3 mensagens por IP a cada 10 min. |
| `/admin-api/*` | Painel: `GET /contagens` (com `editavel`) e `PUT /contagens/instagram` quando não há `META_API_KEY`. O TikTok não tem número (só o @). Exige token do Keycloak com o papel `admin`. |
| `GET /q/health` | Saúde. |

Toda mudança na lista de vídeos, nos repositórios fixados ou feita pelo painel roda o `REBUILD_COMANDO` (no Docker: avisa o construtor do site).

## Vídeos do Instagram

Com `META_API_KEY`, a cada 5 min a API lê os seguidores e as 20 publicações mais recentes; só os vídeos (Reels)
viram card. Título = primeira linha da legenda sem hashtags; categoria = primeira hashtag que estiver em
`portfolio.categorias` (com ou sem acento). A capa é copiada pro MinIO uma vez por Reel (o link do Instagram expira)
e sai de lá quando o Reel sai da lista. Se a capa não vier, o Reel fica de fora até a próxima rodada.

O tipo do token é descoberto na primeira leitura (o texto do token não diz): a API pergunta ao Facebook e, se ele
recusar, ao Instagram.
- **Facebook**: lê a conta `INSTAGRAM_CONTA` em `graph.facebook.com` (basta `instagram_basic`). Sem `INSTAGRAM_CONTA`, acha a conta
  pela Página ligada, e aí precisa também de `pages_show_list` e `pages_read_engagement` (e `business_management` se a Página estiver num portfólio empresarial).
  Prefira um token de Página gerado a partir de um token de usuário de longa duração: esse não vence. A API não renova esse tipo.
- **login do Instagram**: lê `graph.instagram.com/me`. Vence em 60 dias, então a API o renova uma vez por dia
  e guarda o renovado em `dados/meta-token.json` (trocar o `META_API_KEY` faz a API voltar a usar o novo).

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
| `MINIO_URL`, `MINIO_USUARIO`, `MINIO_SENHA` | `http://localhost:9000`, … | MinIO das capas: endereço, access key e secret key. |
| `MINIO_BUCKET` | `capas` | Bucket das capas (criado sozinho se não existir). |
| `KEYCLOAK_URL` | `http://localhost:8180/realms/portfolio` | Realm do Keycloak, pelo endereço interno. |
| `KEYCLOAK_EMISSOR` | `any` | Emissor dos tokens como o navegador vê (ex.: `https://auth.henriquebueno.com/realms/portfolio`). |
| `YOUTUBE_CHAVE` | — | Chave da YouTube Data API v3. Sem ela, o site mostra só o @. |
| `YOUTUBE_CANAL` | `@bueno_dev` | Handle (`@...`) ou id (`UC...`) do canal. |
| `GITHUB_TOKEN` | — | Token só de leitura, pros repositórios fixados (GraphQL). Sem ele, usa a lista copiada no código. |
| `GITHUB_USUARIO` | `Henrique-CBueno` | Perfil do GitHub. |
| `META_API_KEY` | — | Token da Meta pro Instagram (veja acima). Sem ele, os seguidores são digitados no painel e a lista de vídeos fica como está. |
| `INSTAGRAM_CONTA` | `17841421020065645` (@bueno_dev) | Id da conta do Instagram, usado com token do Facebook. Vazio: descoberto pela Página ligada. |
| `MAIL_MOCK` | `true` | Com `true`, os e-mails do formulário só vão pro log. Em produção: `false`. |
| `MAIL_HOST`, `MAIL_PORTA`, `MAIL_USUARIO`, `MAIL_SENHA` | —, `465` | SMTP (TLS). Na Hostinger: `smtp.hostinger.com`, porta 465, usuário = o e-mail. |
| `CONTATO_PARA`, `CONTATO_DE` | `contato@henriquebueno.com` | Destino e remetente do formulário. |
| `REBUILD_COMANDO` | — | Comando rodado quando o painel muda algo. Saída em `dados/rebuild.log`. |

As categorias dos vídeos (a pill colorida, vinda da hashtag) ficam em `portfolio.categorias`, no `application.properties`.
