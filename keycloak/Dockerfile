# Keycloak com o realm "portfolio" (papel admin + client do painel) importado na primeira subida.
# O realm usa ${SITE_URL} (variável de ambiente) nos endereços de retorno do login.
FROM quay.io/keycloak/keycloak:26.8.1
COPY realm-portfolio.json /opt/keycloak/data/import/realm-portfolio.json
# cria a pasta do banco como o usuário do Keycloak, pra o volume nascer com o dono certo
RUN mkdir -p /opt/keycloak/data/h2
