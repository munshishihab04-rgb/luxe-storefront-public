# LUXE Storefront Public Template

Public, sanitized version of the LUXE storefront codebase.

This repository includes:

- React/Vite storefront
- Product catalog structure and sample public product data
- Admin catalog UI code
- Nexi/XPay hosted-payment integration code
- Environment variable template (`.env.example`)

## Security

No production secrets, tokens, private keys, real payment credentials, or private `.env` files are included.
Use `.env.example` as a template and configure real values only in your hosting provider/private server.

## Main commands

```bash
npm install
npm run dev
npm run build
npm run serve:xpay
```

## Environment variables

See `.env.example` for all variables required by the app and payment server.

## Payment note

`XPAY_ALIAS`, `XPAY_SECRET_KEY`, and `ADMIN_TOKEN` must remain private. Never commit real values.

## Production deployment

The repository includes a hardened multi-stage `Dockerfile`, `compose.yaml`, and a Caddy reverse-proxy configuration with automatic HTTPS.

1. Point the final domain DNS records at the production server.
2. Copy `.env.production.example` to `.env.production` and set at minimum:
   - `DOMAIN=shop.example.com`
   - `NODE_ENV=production`
   - `PUBLIC_BASE_URL=https://shop.example.com`
   - `XPAY_ENV=production`
   - real `XPAY_ALIAS` and `XPAY_SECRET_KEY`
   - a random `ADMIN_TOKEN` of at least 32 characters
3. Keep optional Convex/Hercules variables only when the identity backend is configured.
4. Run `docker compose --env-file .env.production up -d --build`.
5. Verify `https://<domain>/api/health`, then execute an XPay test transaction and reconcile it with Nexi before enabling live traffic.

The application refuses to start in production when HTTPS or required secrets are missing/placeholders. Orders are persisted in the `luxe-orders` Docker volume. Back up both that volume and `data/catalog.json`; for multi-instance/high-volume operation, migrate order and catalog storage to a transactional database.

## Release checks

```bash
npm ci
npm run lint
npm test
npm run build
npm audit --omit=dev
```
