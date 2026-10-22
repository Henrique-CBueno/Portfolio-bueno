# Etapa 1: compila e empacota (as dependências ficam em cache enquanto o pom.xml não muda)
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /build
COPY pom.xml .
COPY .mvn .mvn
RUN mvn -q -B dependency:go-offline
COPY src src
RUN mvn -q -B package -DskipTests

# Etapa 2: só a JRE e a aplicação
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
RUN addgroup -S api && adduser -S api -G api && mkdir /dados && chown api:api /dados
COPY --from=build --chown=api:api /build/target/quarkus-app/ /app/
USER api
ENV DADOS=/dados \
    JAVA_OPTS="-Xmx128m -XX:+UseSerialGC"
EXPOSE 8080
VOLUME /dados
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/q/health/ready >/dev/null || exit 1
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/quarkus-run.jar"]
