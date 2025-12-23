FROM node:22 AS base
WORKDIR /app
COPY package.json ./

RUN npm install

COPY . .

ARG BACKEND_PROTOCOL=http
ARG BACKEND_DOMAIN
ARG BACKEND_PORT
ARG BASE_URL
ARG API_PATTERN

ENV BACKEND_PROTOCOL=${BACKEND_PROTOCOL} 
ENV BACKEND_DOMAIN=${BACKEND_DOMAIN} 
ENV BACKEND_PORT=${BACKEND_PORT} 
ENV NEXT_PUBLIC_BASE_URL=${BASE_URL} 
ENV NEXT_PUBLIC_API_PATTERN=${API_PATTERN}

RUN npm run build

FROM node:22-alpine AS release
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
