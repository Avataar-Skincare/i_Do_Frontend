# Multi-stage build for Next.js `output: "standalone"`: the final image holds only
# server.js, the traced runtime deps, static assets and public/.

FROM node:22-alpine AS deps
WORKDIR /app
# npm install -g pnpm, not corepack — corepack's signature verification against the
# npm registry has a known flaky failure mode that broke this exact step before.
# Pinned to package.json's packageManager so a newer pnpm can't reject the lockfile.
RUN npm install -g pnpm@12.4.2
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@12.4.2
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, not read
# at container-start — setting NEXT_PUBLIC_API_URL under `environment:` in
# docker-compose.yml has no effect on an already-built image. It must arrive
# here, as a build arg, before `pnpm build` runs.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    # standalone server.js binds to $HOSTNAME; Docker sets that to the container id,
    # so pin it to all interfaces or nginx can't reach the app.
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["node", "server.js"]
