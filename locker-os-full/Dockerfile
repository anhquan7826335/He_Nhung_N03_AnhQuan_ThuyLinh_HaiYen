# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build
# Output: /app/client/dist

# ── Stage 2: Production backend ───────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Cài dependencies backend
COPY package*.json ./
RUN npm install --omit=dev

# Copy source backend
COPY src/ ./src/

# Copy React build từ stage 1 vào đúng chỗ Express serve
COPY --from=builder /app/client/dist ./client/dist

# Không copy .env — sẽ inject qua docker-compose environment
EXPOSE 5000

CMD ["node", "src/index.js"]
