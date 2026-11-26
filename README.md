# Gameda

O **Gameda** é uma plataforma social para quem gosta de videogames. A proposta é reunir biblioteca pessoal, histórico de sessões e avaliações em um espaço onde jogadores também podem descobrir jogos e acompanhar a atividade de outras pessoas.

> Projeto em desenvolvimento.

## O que já existe

- **Catálogo e descoberta:** pesquisa de jogos, páginas individuais e capas obtidas pela IGDB.
- **Biblioteca pessoal:** organização dos jogos adicionados à conta.
- **Atividade de jogo:** registro de sessões e avaliações, incluindo resenhas.
- **Camada social:** perfis, seguidores, curtidas e comentários.
- **Notificações:** avisos sobre interações e pedidos de inclusão de jogos.
- **Segurança e comunidade:** bloqueio de usuários, denúncias e gerenciamento de conta.
- **Conta e acesso:** autenticação com Supabase, fluxo de recuperação e atualização de senha.

As funcionalidades e a interface continuam evoluindo.

## Tecnologias

- [Next.js](https://nextjs.org/) 16 — App Router
- [React](https://react.dev/) 19 e [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Supabase](https://supabase.com/) — autenticação e banco de dados
- [IGDB API](https://www.igdb.com/api) — catálogo e informações dos jogos
- [Lucide](https://lucide.dev/) — ícones

## Executar localmente

### Pré-requisitos

- Node.js compatível com a versão do Next.js usada pelo projeto
- npm
- Um projeto no Supabase
- Credenciais de API da IGDB (Twitch)

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

IGDB_CLIENT_ID=
IGDB_CLIENT_SECRET=
```

Use as credenciais do seu próprio projeto Supabase e do aplicativo cadastrado para acessar a IGDB.

A aplicação também depende das tabelas, relacionamentos e políticas de segurança (RLS) configurados no banco Supabase do projeto. As instruções de criação desse schema ainda não estão documentadas neste README; apenas preencher as variáveis não cria o banco automaticamente.

**Importante:** `SUPABASE_SECRET_KEY` e `IGDB_CLIENT_SECRET` são segredos de servidor. Não use o prefixo `NEXT_PUBLIC_` neles, não os exponha no código do cliente e nunca envie seu `.env.local` ao Git.

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção |
| `npm run start` | Inicia a versão de produção |
| `npm run lint` | Executa o ESLint |

## Estrutura do projeto

```text
src/
├── app/          # Rotas, páginas e Route Handlers do Next.js
├── components/  # Componentes organizados por área da aplicação
├── hooks/       # Hooks reutilizáveis
└── lib/          # Integrações e lógica compartilhada
```

## Status

O Gameda está em desenvolvimento ativo. Recursos, estrutura e identidade visual podem mudar conforme o projeto amadurece.
