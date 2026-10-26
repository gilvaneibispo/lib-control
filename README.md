# LibControl

O LibControl é um sistema de gestão de biblioteca com catálogo público, reservas e empréstimos de exemplares, cadastro de obras com busca automática por ISBN, classificação por CDD e/ou CDU, além de leitura da página de créditos por reconhecimento óptico de caracteres (_Optical Character Recognition_ - OCR). O projeto compõe a atividade final da disciplina **Plataforma de Desenvolvimento em Software Livre e Servidores Web**, da pós-graduação _Lato Sensu_ em **Desenvolvimento Web** oferecida pelo **Instituto Federal de Educação, Ciência e Tecnologia do Sul de Minas Gerais** (IFSULDEMINAS).

## Funcionalidades

**Leitor (site público)**
- Criação de conta com foto e endereço.
- Busca no acervo por título, autor ou ISBN, com filtros por área e sub-área.
- Reserva de obras com 3 dias para retirada.
- Acompanhamento de reservas e empréstimos.

**Bibliotecária (admin do sistema)**
- Cadastro de obras, buscando metadados e capa pelo ISBN, via APIs BrasilAPI, Open Library, Google Books.
- Área e sub-área preenchidas automaticamente a partir da CDD e/ou CDU
- Botão **Ler página de créditos** para extrai ISBN, CDD e/ou CDU em fotos da página de créditos.
- Gestão de exemplares, retirada de reservas, empréstimo e devolução no balcão.

**Sistema (não depende de usuários)**
- Bloqueio automático de leitores com empréstimo em atraso.
- Cálculo automático de prazos de reserva, empréstimo e dias de atraso.

## Arquitetura

| Serviço              | Tecnologia                            | Acesso                        |
|----------------------|---------------------------------------|-------------------------------|
| `nginx`              | Nginx                                 | `http://localhost` (porta 80) |
| `side`               | React + Bootstrap 5 + Bootstrap Icons | `/`                           |
| `admin`              | React + Bootstrap 5 + Bootstrap Icons | `/admin/`                     |
| `api`                | Laravel + PHP-FPM                     | `/api`                        |
| `postgres`           | PostgreSQL 16                         | interno                       |

## Requisitos

- Docker e Docker Compose
- Node.js 22+ - _apenas para desenvolvimento dos fronts fora do container_.

## Como rodar

```bash
git clone <repo> lib-control && cd lib-control
cp .env.example .env # ajuste senhas e OCR_TOKEN
docker compose up -d --build
docker compose exec api php artisan migrate --seed
docker compose exec api php artisan lib-control:criar-admin
```

Acesse:
- Catálogo: http://localhost:[PORTA]/
- Administração: http://localhost:[PORTA]/admin/

## Variáveis de ambiente

| Variável  | Padrão             | Descrição          |
|-----------|--------------------|--------------------|
| `APP_URL` | `http://localhost` | URL pública        |
| `DB_*`    | —                  | conexão PostgreSQL |
