FROM php:8.4-fpm-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev libzip-dev libpng-dev libjpeg62-turbo-dev libwebp-dev libfreetype6-dev libicu-dev unzip git \
    && docker-php-ext-configure gd --with-jpeg --with-webp --with-freetype \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pgsql gd zip intl bcmath pcntl opcache \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Ajusta permissões! Iguala o UID/GID do www-data ao do usuário do hospedeiro...
ARG UID=1000
ARG GID=1000
RUN groupmod -o -g "${GID}" www-data && usermod -o -u "${UID}" -g "${GID}" www-data \
    && mkdir -p /var/www/.composer && chown -R www-data:www-data /var/www

COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-lib-control.ini

WORKDIR /var/www/html
USER www-data

CMD ["php-fpm"]