# SaaS de página de links e projetos — Next.js + Firebase + Stripe

Aplicação SaaS em que cada usuário cria uma página pública (`/seu-link`) com perfil, redes sociais, links personalizados e projetos. Inclui login com Google, contador de visitas e cobrança via Stripe, com teste gratuito inicial.

## ✨ Funcionalidades

- 🔐 **Login com Google** (NextAuth v5) com usuários e sessões guardados no Firestore
- 🔗 **Página pública por link**: o usuário escolhe um link único (`/criar`) e a página fica em `/<link>`
- 👤 **Perfil editável**: nome, descrição e foto (com compressão de imagem no navegador)
- 🌐 **Redes sociais e links personalizados** na página
- 🗂️ **Projetos** exibidos como cards
- 📈 **Contador de visitas** da página
- 💳 **Pagamentos com Stripe**: assinatura (mensal ou anual) e pagamento único (vitalício) via Checkout, mais o portal de cobrança do Stripe para gerenciar a assinatura
- 🎁 **Teste gratuito** de 3 dias (configurável em `app/lib/config.ts`)
- 🏠 **Landing page** com apresentação, planos e FAQ

## 🛠️ Stack

| Tecnologia | Função |
|---|---|
| [Next.js](https://nextjs.org/) 16 (App Router) | Framework React fullstack, Server Actions e rotas de API |
| [React](https://react.dev/) 19 e [TypeScript](https://www.typescriptlang.org/) | Interface e tipagem |
| [Tailwind CSS](https://tailwindcss.com/) 4 | Estilização |
| [NextAuth](https://authjs.dev/) v5 (beta) com adaptador do Firestore | Autenticação |
| [Firebase Admin](https://firebase.google.com/docs/admin/setup) (Firestore e Storage) | Banco de dados e arquivos |
| [Stripe](https://stripe.com/docs) | Pagamentos e assinaturas |

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 20 ou superior e npm
- Projeto no [Firebase](https://console.firebase.google.com/) com Firestore e Storage habilitados, e uma conta de serviço
- Credenciais OAuth do Google (Google Cloud Console)
- Conta no [Stripe](https://dashboard.stripe.com/) (modo de teste) com os preços criados
- [Stripe CLI](https://docs.stripe.com/stripe-cli) para receber webhooks em ambiente local

### Passos

1. Clone e instale as dependências:

```bash
git clone https://github.com/LOrleans/SaaS-with-Next.git
cd SaaS-with-Next
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Preencha cada variável conforme os comentários do `.env.example`.

3. Em outro terminal, encaminhe os webhooks do Stripe e copie o segredo exibido para `STRIPE_WEBHOOK_SECRET`:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Inicie o servidor:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## 🔑 Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `AUTH_SECRET` | Segredo do NextAuth |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Credenciais OAuth do Google |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET` | Conta de serviço e bucket do Firebase |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUB_KEY` | Chaves do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Segredo do endpoint de webhook |
| `STRIPE_SUBSCRIPTION_MONTH_PRICE_ID`, `STRIPE_SUBSCRIPTION_YEAR_PRICE_ID`, `STRIPE_PRICE_ONLY_ID` | IDs dos preços mensal, anual e pagamento único |

## 🧭 Rotas principais

| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/criar` | Escolha do link da página |
| `/[profileId]` | Página pública do usuário |
| `/[profileId]/upgrade` | Escolha de plano |
| `/api/auth/*` | Autenticação (NextAuth) |
| `/api/stripe/create-checkout` | Cria a sessão de pagamento |
| `/api/stripe/create-portal` | Abre o portal de cobrança |
| `/api/stripe/webhook` | Recebe eventos do Stripe (`checkout.session.completed`, `customer.subscription.created` e `deleted`, `invoice.payment_succeeded`, `invoice.payment_failed` e outros) |

## 🔧 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor em modo produção |
| `npm run lint` | Verifica o código com ESLint |
