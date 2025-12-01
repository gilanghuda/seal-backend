FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ git

COPY package*.json ./
COPY tsconfig.json ./
COPY ace-manifest.json ./

RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/ace ./ace
COPY --from=builder /app/.adonisrc.json .adonisrc.json
COPY --from=builder /app/public/docs ./public/docs
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3333

ENTRYPOINT ["dumb-init", "--", "/app/entrypoint.sh"]
CMD ["node", "build/server.js"]
