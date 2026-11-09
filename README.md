# LibControl

O LibControl é um sistema de gestão de biblioteca com catálogo público, reservas e empréstimos de exemplares, cadastro de obras com busca automática por ISBN e classificação por CDD e/ou CDU. O projeto compõe a atividade final da disciplina **Plataforma de Desenvolvimento em Software Livre e Servidores Web**, da pós-graduação _Lato Sensu_ em **Desenvolvimento Web** oferecida pelo **Instituto Federal de Educação, Ciência e Tecnologia do Sul de Minas Gerais** (IFSULDEMINAS).

## Funcionalidades

**Leitor (site público)**
- Criação de conta com foto e endereço.
- Busca no acervo por título, autor ou ISBN, com filtros por área e sub-área.
- Reserva de obras com 3 dias para retirada.
- Acompanhamento de reservas e empréstimos.

**Bibliotecária (admin do sistema)**
- Cadastro de obras, buscando metadados e capa pelo ISBN, via APIs BrasilAPI, Open Library, Google Books.
- Área e sub-área preenchidas automaticamente a partir da CDD e/ou CDU
- Gestão de exemplares, retirada de reservas, empréstimo e devolução no balcão.

**Sistema (não depende de usuários)**
- Bloqueio automático de leitores com empréstimo em atraso.
- Cálculo automático de prazos de reserva, empréstimo e dias de atraso.

## Arquitetura

| Serviço    | Tecnologia                               | Acesso                               |
|-----------:|------------------------------------------|--------------------------------------|
| `nginx`    | Nginx 1.27                               | `http://localhost:[PUBLIC_APP_PORT]` |
| `site`     | React 19 + Bootstrap 5 + Bootstrap Icons | `/`                                  |
| `admin`    | React 19 + Bootstrap 5 + Bootstrap Icons | `/admin/`                            |
| `api`      | Laravel 13 + PHP-FPM 8.4                 | `/api`                               |
| `postgres` | PostgreSQL 16                            | interno                              |

## Requisitos

- Docker e Docker Compose
- Node.js 24+ - _apenas para desenvolvimento dos fronts fora do container_.

## Como rodar

```bash
git clone <repo> lib-control && cd lib-control
cp .env.example .env # ajuste as senhas
docker compose up -d --build
docker compose exec api php artisan migrate --seed
docker compose exec api php artisan lib-control:criar-admin
```

Acesse:
- Catálogo: http://localhost:[PUBLIC_APP_PORT]/
- Administração: http://localhost:[PUBLIC_APP_PORT]/admin/

## Variáveis de ambiente

| Variável          | Padrão | Descrição                |
|:------------------|:------:|-------------------------:|
| `PUBLIC_APP_PORT` | `5000` | Porta pública do Nginx   |
| `DB_*`            | —      | Conexão PostgreSQL       |
