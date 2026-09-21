FROM node:20-alpine AS deps
WORKDIR /app
# npm install -g pnpm, not corepack — corepack's signature verification against the
# npm registry has a known flaky failure mode that broke this exact step before.
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, not read
# at container-start — setting NEXT_PUBLIC_API_URL under `environment:` in
# docker-compose.yml has no effect on an already-built image. It must arrive
# here, as a build arg, before `pnpm build` runs.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
