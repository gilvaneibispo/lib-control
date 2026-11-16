FROM php:8.4-fpm-alpine

ARG UID=1000
ARG GID=1000

# Extensões necessárias para o Laravel + PostgreSQL
RUN apk add --no-cache \
        git \
        unzip \
        icu-dev \
        libzip-dev \
        postgresql-dev \
    && docker-php-ext-install \
        pdo_pgsql \
        intl \
        zip \
        bcmath \
        opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Usuário com o mesmo UID/GID do host para evitar problemas de permissão nos volumes
RUN addgroup -g ${GID} app \
    && adduser -D -u ${UID} -G app app \
    && sed -i 's/^user = www-data/user = app/; s/^group = www-data/group = app/' /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www/html

USER app

EXPOSE 9000

CMD ["php-fpm"]
