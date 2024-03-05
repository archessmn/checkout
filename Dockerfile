FROM --platform=linux/amd64 node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

##### DEPENDENCIES

FROM oven/bun:latest as base
WORKDIR /app

# Install Prisma Client - remove if not using Prisma

COPY prisma ./

# Install dependencies based on the preferred package manager

FROM base as install
# RUN mkdir -p /temp/dev
# COPY package.json bun.lockb /temp/dev/
# RUN cd /temp/dev && bun install

RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install


FROM base AS prerelease
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
COPY --from=install /temp/prod/node_modules node_modules
COPY . .


ENV NODE_ENV=production
# RUN bun test

# RUN pwd
# RUN ls -lh

RUN SKIP_ENV_VALIDATION=1 bun run build -- -d

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/next.config.js ./
COPY --from=prerelease /app/public ./public
COPY --from=prerelease /app/package.json ./package.json

COPY --from=prerelease /app/.next/standalone ./
COPY --from=prerelease /app/.next/static ./.next/static

# FROM --platform=linux/amd64 gcr.io/distroless/nodejs20-debian12 AS runner
# WORKDIR /app


# COPY --from=builder /app/next.config.js ./
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json

# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000/tcp
ENV PORT 3000

CMD ["bun", "run", "server.js"]