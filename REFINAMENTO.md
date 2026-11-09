# Refinamento: o que falta do projeto base

Checklist para acompanhar a reimplementação do que ainda falta do [projeto base](../atv-final-lib/).

## Etapa 1: Perfil do leitor e CEP

Essas rotas já são chamadas pelo site, mas ainda não existem na API.

### Backend

- [ ] `GET /cep/{cep}` com `throttle:30,1` (base: `CepController`, `CepLookupService`)
- [ ] `GET /me` (base: `MeController@show`)
- [ ] `PUT /me` com troca de senha (base: `MeController@update`, `AtualizarPerfilRequest`)
- [ ] `POST /me/foto` (base: `MeController@foto`, `FotoRequest`, `FotoService`, `ImagemService`)
- [ ] Gravar a foto enviada no cadastro (`AuthController@registrar`) no lugar de `FakeTemp::USUARIO_FOTO_PERFIL_PATH`
- [ ] Revisar a foto padrão do admin em `AdminService` (também usa `FakeTemp`)

### Front (site)

- [ ] Testar a página Perfil: dados, edição, senha e foto
- [ ] Testar o preenchimento do endereço pelo CEP em Criar conta e em Perfil

## Etapa 2: Capa do livro

### Backend

- [x] Migration: coluna `capa_origem` em `livros`
- [x] Enum `OrigemCapa` (`brasilapi`, `openlibrary`, `google`, `upload`)
- [x] `POST /admin/livros/{livro}/capa`, por URL ou arquivo (base: `CapaRequest`, `CapaService`)
- [x] `DELETE /admin/livros/{livro}/capa`
- [x] Incluir `capa_origem` no `LivroResource`, se o base expuser esse campo
- [x] Remover `FakeTemp::LIVRO_CAPA_PATH` quando não for mais usado

### Front (admin)

- [x] Serviços `capaPorUrl`, `capaPorArquivo` e `removerCapa`
- [x] Escolha, envio e remoção da capa no `LivroForm`

## Etapa 3: Autores

### Backend

- [x] `GET /admin/autores?q=` (base: `Admin\AutorController`)

### Front (admin)

- [x] Serviço `autores`
- [x] Ligar as sugestões do `AutoresInput` ao serviço

## Etapa 4: Busca por ISBN

### Backend

- [x] Regra `IsbnValido` e suporte `Isbn` (normalização, ISBN-10 e ISBN-13)
- [x] `IsbnLookupService` (BrasilAPI, OpenLibrary, Google Books)
- [x] `GET /admin/isbn/{isbn}` (base: `IsbnController`)
- [x] Remover `FakeTemp::LIVRO_ISBN` quando não for mais usado

### Front (admin)

- [x] Serviço `isbn`
- [x] Busca ao sair do campo ISBN no `LivroForm`, preenchendo os campos e as capas candidatas

## Etapa 5: Classificação (CDD/CDU → área e subárea)

### Backend

- [ ] Migration: tabela `regras_classificacao`
- [ ] Enum `SistemaClassificacao` (`CDD`, `CDU`)
- [ ] Model `RegraClassificacao`
- [ ] Seeder das regras (base: `ClassificacaoSeeder`)
- [ ] `ClassificationResolver`
- [ ] `POST /admin/classificacao/resolver` (base: `ClassificacaoController`, `ResolverClassificacaoRequest`, `ClassificacaoResource`)
- [ ] Remover `FakeTemp::LIVRO_CDD` e `FakeTemp::LIVRO_CDU` quando não forem mais usados

### Front (admin)

- [ ] Serviço `resolverClassificacao`
- [ ] Sugestão de área e subárea no `LivroForm` ao preencher CDD ou CDU

## Etapa 6: Infraestrutura (docker-compose)

- [ ] Serviço `redis`
- [ ] Serviço `queue`
- [ ] Serviço `scheduler`, para rodar `reservas:expirar` e `emprestimos:verificar-atrasos`
- [ ] Volume `valkeydata`

## Etapa 7: Dados de demonstração

- [ ] `LivroFactory` (base: `ObraFactory`)
- [ ] `DemoSeeder` com `database/data/demo-obras.json`
- [ ] Remover o enum `FakeTemp` depois que nenhum código usar mais

## Etapa 8: Testes

### API (Pest)

- [ ] `AuthTest`
- [ ] `BloqueioTest`
- [ ] `CatalogoPublicoTest`
- [ ] `ClassificacaoTest`
- [ ] `DashboardTest`
- [ ] `EmprestimoTest`
- [ ] `LivroAdminTest` (base: `ObraAdminTest`)
- [ ] `ReservaTest`
- [ ] `ReservaConcorrenteTest` (pasta `Concorrencia`)
- [ ] Remover os `ExampleTest`

### Front (vitest)

- [ ] `esquemas.test.ts`
- [ ] `filtroAreas.test.ts`
- [ ] `mascaras.test.ts`
- [ ] `validadores.test.ts`
- [ ] `formatadores.test.ts`
- [ ] `erros.test.ts`
- [ ] `hooks.test.ts`, se houver hooks equivalentes

## Opcionais

- [ ] Página `/_ui` no admin (base: `CatalogoUi`, vitrine de componentes)
- [ ] Redirecionamentos `livros/:id/exemplares` e `leitores/:id` para o painel lateral
