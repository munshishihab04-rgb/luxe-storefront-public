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
