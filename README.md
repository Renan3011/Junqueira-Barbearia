# Sistema de agendamento para barbearia

Projeto local de demonstração. Os nomes, endereço, telefone, serviços e valores iniciais são fictícios e podem ser alterados no seed (`backend/prisma/seed.ts`) e pelo painel.

## Rodar pela primeira vez

1. Instale as dependências: `npm install`
2. Copie `.env.example` para `backend/.env` e escolha uma senha inicial segura.
3. Inicie o banco: `docker compose up -d`
4. Gere o cliente e as tabelas: `npm run db:generate` e `npm run db:migrate`
5. Carregue os dados demonstrativos: `npm run db:seed`
6. Inicie tudo: `npm run dev`

Abra `http://localhost:5173`. O painel fica em `http://localhost:5173/painel`.

O login demonstrativo usa o e-mail e a senha definidos em `backend/.env` (`ADMIN_EMAIL` e `ADMIN_PASSWORD`); não há senha gravada no código.

## Comandos úteis

- `npm run test` — regras de horários e prevenção de conflitos.
- `npm run build` — valida TypeScript e gera os builds.
- `docker compose down` — para o banco, mantendo seus dados no volume.
- `docker compose down -v` — remove também os dados locais do banco (use somente se quiser recomeçar).

## Como publicar futuramente

GitHub guarda o código e seu histórico; hospedagem é o serviço que mantém frontend e API acessíveis na internet. Para publicar, escolha uma hospedagem de frontend estático e uma que execute Node.js, crie um PostgreSQL gerenciado e configure no backend `DATABASE_URL`, `FRONTEND_URL`, `SESSION_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Rode `npx prisma migrate deploy` uma única vez contra o banco de produção antes de atender clientes. Depois, abra a URL fornecida pela hospedagem, teste o agendamento e o login com dados de teste antes de divulgar.

Lembretes de WhatsApp precisam de uma conta e credenciais de um provedor, consentimento dos clientes e um agendador de tarefas. O módulo `backend/src/notifications/whatsapp.ts` existe como ponto de integração, mas não envia mensagens nem afirma que enviou.
