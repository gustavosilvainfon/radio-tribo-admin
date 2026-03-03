# Rádio Tribo - Painel Administrativo

Painel administrativo da Rádio Tribo, desenvolvido em **Next.js (App Router)**.

- Gerencia notícias, programação, promoções e Top 10
- Consome a API em `https://api.gsolucoes.app.br`

## Requisitos
- Node.js 18+
- npm

## Como rodar local
```bash
cd "C:\Users\gugu_\Desktop\Radio Tribo\radio-tribo-admin"
npm install
npm run dev
```
Acesse `http://localhost:3000`.

## Build e produção
```bash
cd "C:\Users\gugu_\Desktop\Radio Tribo\radio-tribo-admin"
npm run build
npm start    # ou: next start
```

## Variáveis de ambiente (`.env.local`)
```env
NEXT_PUBLIC_API_URL=https://api.gsolucoes.app.br
NEXT_PUBLIC_APP_NAME=Rádio Tribo - Painel Admin
```

## Deploy (fluxo)
1. **PC**
```bash
git add .
git commit -m "sua mudança"
git push origin main
```
2. **Servidor**
```bash
cd /srv/admin.gsolucoes.app.br/www
git pull origin main
npm install
npm run build
export PATH="/var/www/.virtualenvs/tribo-painel.607e7f89.configr.cloud/18.11.0/bin:$PATH"
pm2 restart admin-panel
```

---

O backend correspondente está em `radio-tribo-backend` e o site público em `radio-tribo-site`.
