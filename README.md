# Junqueira's Barbearia

Sistema de agendamento para a Junqueira's Barbearia. O projeto reúne uma página pública para clientes e um painel administrativo para o barbeiro acompanhar agenda, pedidos e serviços.

Alguns textos, imagens e avaliações estão identificados como **demonstrativos**. Eles devem ser substituídos por informações oficiais antes da publicação.

## Funcionalidades

### Site público

- Apresentação da barbearia, serviços, galeria, avaliações demonstrativas e contatos.
- Carrosséis acessíveis de fotos, galeria e serviços, com controles por botão, teclado e toque.
- Formulário de agendamento conectado à API, com consulta de serviços ativos e horários disponíveis.
- Validação de telefone no navegador e no servidor.
- Links para ligação telefônica e para o endereço no Google Maps.

### Painel do barbeiro

- Login com sessão por cookie.
- Visualização de agenda por dia ou semana.
- Criação manual de atendimentos e atualização de status ou observações.
- Cadastro, edição, ativação e desativação de serviços.
- Lista de novos pedidos, atualização periódica e notificações do navegador sob permissão.

## Tecnologias

- React, TypeScript e Vite no frontend.
- Node.js, Express e TypeScript na API.
- Prisma ORM e PostgreSQL no banco de dados.
- Docker Compose para o PostgreSQL local.
- Vitest para os testes do backend.
- `libphonenumber-js` para validação e normalização de telefones.

## Estrutura principal

```text
.
├── frontend/
│   ├── public/images/        # Imagens demonstrativas
│   └── src/                 # Página pública, painel e estilos
├── backend/
│   ├── prisma/              # Schema, migrations e seed
│   └── src/                 # API, autenticação e validações
├── docker-compose.yml       # PostgreSQL local
├── .env.example             # Modelo de variáveis do backend
└── package.json             # Workspaces e comandos
```

## Pré-requisitos

- Node.js compatível com as dependências do projeto.
- npm.
- Docker Desktop em execução para usar o PostgreSQL local.

## Primeira execução

1. Clone o repositório ou abra a pasta do projeto.
2. Instale as dependências:

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

4. Edite `backend/.env` com valores adequados para o seu ambiente. As variáveis usadas são `DATABASE_URL`, `FRONTEND_URL`, `PORT`, `NODE_ENV`, `SESSION_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Use valores próprios e seguros para os segredos. Não envie esse arquivo ao Git.
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

   O seed usa `ADMIN_EMAIL` e `ADMIN_PASSWORD` de `backend/.env` para criar ou atualizar o acesso administrativo, além dos serviços e horários demonstrativos.

8. Inicie o frontend e a API:

   ```bash
   npm run dev
   ```

## Endereços locais

- Site público: [http://localhost:5173](http://localhost:5173)
- Painel: [http://localhost:5173/painel](http://localhost:5173/painel)
- Verificação da API: [http://localhost:3333/health](http://localhost:3333/health)

O Vite aceita conexões da rede local. Com o servidor em execução, um celular na mesma rede pode abrir o endereço de rede exibido pelo Vite; a API continua acessível pelo proxy de desenvolvimento.

## Comandos disponíveis

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

1. A pessoa escolhe um serviço, data, horário e informa seus dados no formulário do site.
2. O frontend consulta `GET /api/services` e `GET /api/availability` para mostrar serviços ativos e horários livres.
3. Ao enviar, o formulário chama `POST /api/bookings`.
4. A API valida os dados, normaliza o telefone e confere expediente, bloqueios e conflitos.
5. O Prisma salva ou atualiza o cliente e cria o agendamento no PostgreSQL.
6. No painel, `GET /api/admin/bookings` exibe o compromisso e `GET /api/admin/notifications` o inclui entre os novos pedidos pendentes do site.

O site só exibe sucesso depois de a API aceitar e salvar o pedido.

## Gestão pelo painel

Entre em `/painel` com o e-mail e a senha configurados em `backend/.env`.

- Use a navegação de data e as opções **Dia** e **Semana** para consultar a agenda.
- Use **Adicionar atendimento** para registrar um compromisso incluído pelo barbeiro.
- Atualize um pedido para confirmado, concluído ou cancelado e edite sua observação quando necessário.
- Em **Catálogo de serviços**, crie ou edite nome, descrição, preço e duração.
- Desative um serviço para ocultá-lo do site. Os agendamentos anteriores são preservados.

## Conteúdos e imagens demonstrativos

- Textos institucionais, contato e horário: constante `content` em [frontend/src/main.tsx](frontend/src/main.tsx).
- Avaliações demonstrativas: array `reviews` no mesmo arquivo.
- Imagens: `frontend/public/images/` e array `photos` em `frontend/src/main.tsx`.
- Espaço de logo: componente `Brand` em `frontend/src/main.tsx`.
- Serviços demonstrativos iniciais: `backend/prisma/seed.ts`. Serviços reais também podem ser gerenciados pelo painel.

Ao substituir avaliações ou fotos, obtenha autorização e use apenas conteúdo que a barbearia possa publicar.

## Notificações

O painel consulta novos pedidos periodicamente enquanto está aberto. Se o barbeiro clicar em **Ativar notificações neste navegador** e conceder permissão, o navegador pode mostrar um aviso durante essa sessão.

Isso não configura notificações com o navegador ou painel fechado. Para push nesse cenário, será necessário hospedar o sistema em HTTPS, criar e registrar um service worker, armazenar com segurança a assinatura de push de cada navegador autorizado e configurar o envio no servidor sem expor chaves.

O arquivo `backend/src/notifications/whatsapp.ts` é apenas um ponto de extensão; ele não envia mensagens.

## Problemas comuns

### Docker não está aberto

Abra o Docker Desktop e execute `docker compose up -d`. Verifique o status com `docker compose ps`.

### Porta ocupada

Verifique se outro processo está usando as portas do Vite, da API ou do PostgreSQL. Pare o processo conflitante ou ajuste a configuração do ambiente local de forma consistente.

### Banco indisponível ou migrations falhando

Confirme que o PostgreSQL está em execução e que `DATABASE_URL` em `backend/.env` aponta para ele. Em seguida, execute `npm run db:generate` e `npm run db:migrate` novamente.

### Login não funciona

Confira `ADMIN_EMAIL` e `ADMIN_PASSWORD` em `backend/.env` e execute `npm run db:seed` para atualizar o usuário demonstrativo. Não inclua a senha em issues, commits ou capturas de tela.

### Site não abre no celular da mesma rede

Confirme que computador e celular estão na mesma rede Wi-Fi, que `npm run dev` está ativo e que o firewall permite a conexão local.

## Publicação em produção

O projeto não está hospedado por padrão. Antes de publicar, escolha hospedagem para frontend e API Node.js, provisione PostgreSQL gerenciado, configure URLs públicas, CORS e `FRONTEND_URL`, crie segredos seguros no ambiente da hospedagem e aplique as migrations no banco de produção. Use HTTPS e teste agendamento, login, sessão e notificações em homologação. Também planeje backups, monitoramento e atualizações antes de atender clientes.

Não use o seed demonstrativo para substituir dados de produção sem uma estratégia de migração e backup.

## Segurança

- `.env` e `backend/.env` são protegidos pelo `.gitignore`; mantenha credenciais apenas nesses arquivos ou no gerenciador de segredos da hospedagem.
- Nunca registre, publique ou envie senhas, tokens, chaves de sessão ou URLs com credenciais.
- Use senha administrativa forte e altere valores demonstrativos antes da publicação.
- Restrinja o acesso ao banco e mantenha Docker, Node.js e dependências atualizados.
