# Junqueira's Barbearia

Sistema de agendamento para a Junqueira's Barbearia. O projeto reÃºne uma pÃ¡gina pÃºblica para clientes e um painel administrativo para o barbeiro acompanhar agenda, pedidos e serviÃ§os.

Alguns textos, imagens e avaliaÃ§Ãµes estÃ£o identificados como **demonstrativos**. Eles devem ser substituÃ­dos por informaÃ§Ãµes oficiais antes da publicaÃ§Ã£o.

## Funcionalidades

### Site pÃºblico

- ApresentaÃ§Ã£o da barbearia, serviÃ§os, galeria, avaliaÃ§Ãµes demonstrativas e contatos.
- CarrossÃ©is acessÃ­veis de fotos, galeria e serviÃ§os, com controles por botÃ£o, teclado e toque.
- FormulÃ¡rio de agendamento conectado Ã  API, com consulta de serviÃ§os ativos e horÃ¡rios disponÃ­veis.
- ValidaÃ§Ã£o de telefone no navegador e no servidor.
- Links para ligaÃ§Ã£o telefÃ´nica e para o endereÃ§o no Google Maps.

### Painel do barbeiro

- Login com sessÃ£o por cookie.
- VisualizaÃ§Ã£o de agenda por dia ou semana.
- CriaÃ§Ã£o manual de atendimentos e atualizaÃ§Ã£o de status ou observaÃ§Ãµes.
- Cadastro, ediÃ§Ã£o, ativaÃ§Ã£o e desativaÃ§Ã£o de serviÃ§os.
- Lista de novos pedidos, atualizaÃ§Ã£o periÃ³dica e notificaÃ§Ãµes do navegador sob permissÃ£o.

## Tecnologias

- React, TypeScript e Vite no frontend.
- Node.js, Express e TypeScript na API.
- Prisma ORM e PostgreSQL no banco de dados.
- Docker Compose para o PostgreSQL local.
- Vitest para os testes do backend.
- `libphonenumber-js` para validaÃ§Ã£o e normalizaÃ§Ã£o de telefones.

## Estrutura principal

```text
.
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ public/images/        # Imagens demonstrativas
â”‚   â””â”€â”€ src/                 # PÃ¡gina pÃºblica, painel e estilos
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ prisma/              # Schema, migrations e seed
â”‚   â””â”€â”€ src/                 # API, autenticaÃ§Ã£o e validaÃ§Ãµes
â”œâ”€â”€ docker-compose.yml       # PostgreSQL local
â”œâ”€â”€ .env.example             # Modelo de variÃ¡veis do backend
â””â”€â”€ package.json             # Workspaces e comandos
```

## PrÃ©-requisitos

- Node.js compatÃ­vel com as dependÃªncias do projeto.
- npm.
- Docker Desktop em execuÃ§Ã£o para usar o PostgreSQL local.

## Primeira execuÃ§Ã£o

1. Clone o repositÃ³rio ou abra a pasta do projeto.
2. Instale as dependÃªncias:

   ```bash
   npm install
   ```

3. Crie o arquivo de ambiente do backend:

   ```powershell
   Copy-Item .env.example backend/.env
   ```

   Em macOS ou Linux, use:

   ```bash
   cp .env.example backend/.env
   ```

4. Edite `backend/.env` com valores adequados para o seu ambiente. As variÃ¡veis usadas sÃ£o `DATABASE_URL`, `FRONTEND_URL`, `PORT`, `NODE_ENV`, `SESSION_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Use valores prÃ³prios e seguros para os segredos. NÃ£o envie esse arquivo ao Git.
5. Inicie o PostgreSQL:

   ```bash
   docker compose up -d
   ```

6. Gere o Prisma Client e aplique as migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

7. Para criar ou atualizar os dados demonstrativos iniciais:

   ```bash
   npm run db:seed
   ```

   O seed usa `ADMIN_EMAIL` e `ADMIN_PASSWORD` de `backend/.env` para criar ou atualizar o acesso administrativo, alÃ©m dos serviÃ§os e horÃ¡rios demonstrativos.

8. Inicie o frontend e a API:

   ```bash
   npm run dev
   ```

## EndereÃ§os locais

- Site pÃºblico: [http://localhost:5173](http://localhost:5173)
- Painel: [http://localhost:5173/painel](http://localhost:5173/painel)
- VerificaÃ§Ã£o da API: [http://localhost:3333/health](http://localhost:3333/health)

O Vite aceita conexÃµes da rede local. Com o servidor em execuÃ§Ã£o, um celular na mesma rede pode abrir o endereÃ§o de rede exibido pelo Vite; a API continua acessÃ­vel pelo proxy de desenvolvimento.

## Comandos disponÃ­veis

| Finalidade | Comando |
| --- | --- |
| Iniciar frontend e API | `npm run dev` |
| Gerar Prisma Client | `npm run db:generate` |
| Criar/aplicar migration de desenvolvimento | `npm run db:migrate` |
| Popular dados demonstrativos | `npm run db:seed` |
| Executar testes | `npm run test` |
| Compilar backend e frontend | `npm run build` |

Para parar o banco sem apagar os dados do volume, use `docker compose down`. Evite comandos que removem volumes caso queira preservar os dados locais.

## Caminho do agendamento

1. A pessoa escolhe um serviÃ§o, data, horÃ¡rio e informa seus dados no formulÃ¡rio do site.
2. O frontend consulta `GET /api/services` e `GET /api/availability` para mostrar serviÃ§os ativos e horÃ¡rios livres.
3. Ao enviar, o formulÃ¡rio chama `POST /api/bookings`.
4. A API valida os dados, normaliza o telefone e confere expediente, bloqueios e conflitos.
5. O Prisma salva ou atualiza o cliente e cria o agendamento no PostgreSQL.
6. No painel, `GET /api/admin/bookings` exibe o compromisso e `GET /api/admin/notifications` o inclui entre os novos pedidos pendentes do site.

O site sÃ³ exibe sucesso depois de a API aceitar e salvar o pedido.

## GestÃ£o pelo painel

Entre em `/painel` com o e-mail e a senha configurados em `backend/.env`.

- Use a navegaÃ§Ã£o de data e as opÃ§Ãµes **Dia** e **Semana** para consultar a agenda.
- Use **Adicionar atendimento** para registrar um compromisso incluÃ­do pelo barbeiro.
- Atualize um pedido para confirmado, concluÃ­do ou cancelado e edite sua observaÃ§Ã£o quando necessÃ¡rio.
- Em **CatÃ¡logo de serviÃ§os**, crie ou edite nome, descriÃ§Ã£o, preÃ§o e duraÃ§Ã£o.
- Desative um serviÃ§o para ocultÃ¡-lo do site. Os agendamentos anteriores sÃ£o preservados.

## ConteÃºdos e imagens demonstrativos

- Textos institucionais, contato e horÃ¡rio: constante `content` em [frontend/src/main.tsx](frontend/src/main.tsx).
- AvaliaÃ§Ãµes demonstrativas: array `reviews` no mesmo arquivo.
- Imagens: `frontend/public/images/` e array `photos` em `frontend/src/main.tsx`.
- EspaÃ§o de logo: componente `Brand` em `frontend/src/main.tsx`.
- ServiÃ§os demonstrativos iniciais: `backend/prisma/seed.ts`. ServiÃ§os reais tambÃ©m podem ser gerenciados pelo painel.

Ao substituir avaliaÃ§Ãµes ou fotos, obtenha autorizaÃ§Ã£o e use apenas conteÃºdo que a barbearia possa publicar.

## NotificaÃ§Ãµes

O painel consulta novos pedidos periodicamente enquanto estÃ¡ aberto. Se o barbeiro clicar em **Ativar notificaÃ§Ãµes neste navegador** e conceder permissÃ£o, o navegador pode mostrar um aviso durante essa sessÃ£o.

Isso nÃ£o configura notificaÃ§Ãµes com o navegador ou painel fechado. Para push nesse cenÃ¡rio, serÃ¡ necessÃ¡rio hospedar o sistema em HTTPS, criar e registrar um service worker, armazenar com seguranÃ§a a assinatura de push de cada navegador autorizado e configurar o envio no servidor sem expor chaves.

O arquivo `backend/src/notifications/whatsapp.ts` Ã© apenas um ponto de extensÃ£o; ele nÃ£o envia mensagens.

## Problemas comuns

### Docker nÃ£o estÃ¡ aberto

Abra o Docker Desktop e execute `docker compose up -d`. Verifique o status com `docker compose ps`.

### Porta ocupada

Verifique se outro processo estÃ¡ usando as portas do Vite, da API ou do PostgreSQL. Pare o processo conflitante ou ajuste a configuraÃ§Ã£o do ambiente local de forma consistente.

### Banco indisponÃ­vel ou migrations falhando

Confirme que o PostgreSQL estÃ¡ em execuÃ§Ã£o e que `DATABASE_URL` em `backend/.env` aponta para ele. Em seguida, execute `npm run db:generate` e `npm run db:migrate` novamente.

### Login nÃ£o funciona

Confira `ADMIN_EMAIL` e `ADMIN_PASSWORD` em `backend/.env` e execute `npm run db:seed` para atualizar o usuÃ¡rio demonstrativo. NÃ£o inclua a senha em issues, commits ou capturas de tela.

### Site nÃ£o abre no celular da mesma rede

Confirme que computador e celular estÃ£o na mesma rede Wi-Fi, que `npm run dev` estÃ¡ ativo e que o firewall permite a conexÃ£o local.

## PublicaÃ§Ã£o em produÃ§Ã£o

O projeto nÃ£o estÃ¡ hospedado por padrÃ£o. Antes de publicar, escolha hospedagem para frontend e API Node.js, provisione PostgreSQL gerenciado, configure URLs pÃºblicas, CORS e `FRONTEND_URL`, crie segredos seguros no ambiente da hospedagem e aplique as migrations no banco de produÃ§Ã£o. Use HTTPS e teste agendamento, login, sessÃ£o e notificaÃ§Ãµes em homologaÃ§Ã£o. TambÃ©m planeje backups, monitoramento e atualizaÃ§Ãµes antes de atender clientes.

NÃ£o use o seed demonstrativo para substituir dados de produÃ§Ã£o sem uma estratÃ©gia de migraÃ§Ã£o e backup.

## SeguranÃ§a

- `.env` e `backend/.env` sÃ£o protegidos pelo `.gitignore`; mantenha credenciais apenas nesses arquivos ou no gerenciador de segredos da hospedagem.
- Nunca registre, publique ou envie senhas, tokens, chaves de sessÃ£o ou URLs com credenciais.
- Use senha administrativa forte e altere valores demonstrativos antes da publicaÃ§Ã£o.
- Restrinja o acesso ao banco e mantenha Docker, Node.js e dependÃªncias atualizados.
