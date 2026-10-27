## Serve os fronts com SPA único, identificando o admin pelo prefixo `/admin` na URL.
FROM node:24-alpine AS build
WORKDIR /src
COPY apps/site/package.json apps/site/package-lock.json apps/site/
COPY apps/admin/package.json apps/admin/package-lock.json apps/admin/
RUN npm ci --prefix apps/site --no-audit --no-fund \
    && npm ci --prefix apps/admin --no-audit --no-fund
COPY apps apps
RUN npm run build --prefix apps/site \
    && npm run build --prefix apps/admin

FROM nginx:1.27-alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/apps/site/dist /usr/share/nginx/html
COPY --from=build /src/apps/admin/dist /usr/share/nginx/html/admin
