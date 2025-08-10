# Stage 0: Get base system
FROM node:20-alpine AS base


# Stage 1: Instal dependencies 
FROM base AS dependencies
WORKDIR /application
COPY package*.json ./
RUN npm ci


# Stage 2: Build
FROM base AS builder
WORKDIR /application
COPY --from=dependencies /application/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build


# Stage 3: Start
FROM base AS runner
WORKDIR /application
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /application/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /application/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /application/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD HOSTNAME="0.0.0.0" node server.js
