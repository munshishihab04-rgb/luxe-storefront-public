FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_CONVEX_URL
ARG VITE_HERCULES_OIDC_AUTHORITY
ARG VITE_HERCULES_OIDC_CLIENT_ID
ARG VITE_HERCULES_OIDC_PROMPT
ARG VITE_HERCULES_OIDC_RESPONSE_TYPE
ARG VITE_HERCULES_OIDC_SCOPE
ARG VITE_HERCULES_OIDC_REDIRECT_URI
ARG VITE_HERCULES_WEBSITE_ID
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL \
    VITE_HERCULES_OIDC_AUTHORITY=$VITE_HERCULES_OIDC_AUTHORITY \
    VITE_HERCULES_OIDC_CLIENT_ID=$VITE_HERCULES_OIDC_CLIENT_ID \
    VITE_HERCULES_OIDC_PROMPT=$VITE_HERCULES_OIDC_PROMPT \
    VITE_HERCULES_OIDC_RESPONSE_TYPE=$VITE_HERCULES_OIDC_RESPONSE_TYPE \
    VITE_HERCULES_OIDC_SCOPE=$VITE_HERCULES_OIDC_SCOPE \
    VITE_HERCULES_OIDC_REDIRECT_URI=$VITE_HERCULES_OIDC_REDIRECT_URI \
    VITE_HERCULES_WEBSITE_ID=$VITE_HERCULES_WEBSITE_ID
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV PORT=4173
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/data ./data
RUN mkdir -p /app/var/orders && chown -R node:node /app/var
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:4173/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/xpay-server.mjs"]
