FROM node:20-alpine

# Instala pnpm
RUN npm install -g pnpm

# Cria diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos essenciais primeiro
COPY pnpm-lock.yaml ./
COPY package.json ./

# Instala dependências
RUN pnpm install

# Copia o resto da aplicação
COPY . .

# Expõe a porta usada no dev (Next.js usa 3000 por padrão)
EXPOSE 3000

# Comando de dev
CMD ["pnpm", "dev"]
