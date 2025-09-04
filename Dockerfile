# Usa uma imagem oficial do Node.js como base para a etapa de construção
FROM node:20-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de configuração do projeto
COPY package.json .
COPY pnpm-lock.yaml .

# Instala o pnpm globalmente e depois as dependências do projeto
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copia todo o código do projeto para o contêiner
COPY . .

# Executa o build de produção do Next.js
RUN pnpm run build

# --- FASE DE PRODUÇÃO ---

# Usa uma imagem menor para a produção, ideal para o Cloud Run
FROM node:20-alpine AS runner

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos essenciais da etapa de construção para a etapa de produção
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# O Next.js por defeito usa a porta 3000, mas o Cloud Run usa a 8080.
# A variável de ambiente PORT irá sobrepor a porta padrão.
ENV PORT 8080
EXPOSE 8080

# Comando para iniciar o servidor Next.js em produção
CMD ["pnpm", "run", "start"]