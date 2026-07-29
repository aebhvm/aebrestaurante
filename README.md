# AEB Restaurante

Aplicação Next.js para operação do restaurante, com autenticação, perfis de acesso, fichas técnicas, escalas, descansos, tarefas, notícias e estoque.

## Organizacao

- `app/`: rotas, layouts, Server Actions e endpoints da aplicacao.
- `components/`: componentes reutilizaveis da interface; `components/ui/` concentra os componentes basicos.
- `db/`: schema Drizzle, migracoes SQL e seed.
- `lib/`: acesso a dados, sessao, permissoes, validadores e utilitarios.
- `public/`: arquivos publicos estaticos.

As rotas de negócio ficam agrupadas em `app/(app)/`; arquivos de API seguem em `app/api/`. Os nomes de arquivos e pastas usam kebab-case.

## Configuração

1. Copie `.env.example` para `.env.local`.
2. Defina `DATABASE_URL`, `AUTH_SECRET` com pelo menos 32 caracteres e o token do Blob quando houver upload externo.
3. Para executar o seed, defina `SEED_PASSWORD` com pelo menos 12 caracteres e rode `npm run db:seed`.

Nunca coloque valores reais de banco, tokens ou senhas no repositório.

## Comandos

- `npm run dev`: desenvolvimento.
- `npm run build`: build de producao.
- `npm run lint`: verificacao de lint.
- `npx tsc --noEmit`: verificacao de tipos.
- `npm run db:migrate`: aplica migracoes.

## Segurança

As mutações validam os dados no servidor e exigem sessão com o perfil autorizado. Em produção, a aplicação exige um segredo de sessão forte, desabilita o login demo e envia cabeçalhos HTTP de proteção. O seed recebe a senha por variável de ambiente e não a imprime nos logs.
