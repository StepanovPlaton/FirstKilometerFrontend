FROM node:22 AS base
WORKDIR /app
COPY package.json ./

RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine AS release
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
