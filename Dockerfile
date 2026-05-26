# Build frontend assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json postcss.config.js tailwind.config.js ./
COPY index.html ./
COPY public ./public
COPY src ./src
RUN npm ci && npm run build

# Build backend and copy frontend assets into Spring Boot static resources
FROM maven:3.9.5-eclipse-temurin-17 AS backend-builder
WORKDIR /app
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN mkdir -p backend/src/main/resources/static
COPY --from=frontend-builder /app/dist/. backend/src/main/resources/static/
RUN mvn -q -f backend/pom.xml -DskipTests package

# Runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-builder /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
