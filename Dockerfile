# Stage 1: Builder
# Usa uma imagem Node.js Alpine específica para consistência e tamanho reduzido.
FROM node:20.12.2-alpine AS builder

# Define o diretório de trabalho para a aplicação dentro do contêiner.
WORKDIR /app

# Instala dependências de build necessárias para alguns pacotes nativos (g++, make, py3-pip).
# Remova se sua aplicação não tiver dependências nativas.
RUN apk add --no-cache g++ make py3-pip

# Habilita e configura o pnpm para gerenciar pacotes.
RUN corepack enable && corepack prepare pnpm@8.10.2 --activate

# Copia os arquivos de configuração de dependência primeiro para aproveitar o cache do Docker.
COPY package.json pnpm-lock.yaml ./

# Define a variável de ambiente para produção.
ENV NODE_ENV=production

# Instala as dependências do projeto.
RUN pnpm install

# Copia todo o código-fonte da aplicação para o diretório de trabalho.
COPY . .

# Executa o comando de build do Next.js.
# Garanta que seu 'next.config.js' tenha 'output: "standalone"' e, se aplicável, 'distDir: "out"'.
# O comando 'pnpm run build' gerará os arquivos de build dentro de 'out/dist' conforme sua configuração.
RUN pnpm run build

# Stage 2: Runner
# Usa a mesma imagem Node.js Alpine para o ambiente de execução.
FROM node:20.12.2-alpine

# Define o diretório de trabalho para a aplicação final.
WORKDIR /app

# Instala 'libc6-compat', que é essencial para o Next.js standalone rodar em Alpine Linux.
RUN apk add --no-cache libc6-compat

# Copia o diretório de build 'out/dist' (onde o Next.js standalone está localizado)
# para a raiz do diretório de trabalho do estágio 'runner'.
# Este diretório 'out/dist' deve conter o 'server.js' e todos os arquivos compilados e estáticos.
COPY --from=builder /app/out/dist ./

# Copia o diretório 'public' que contém assets estáticos que não são parte do bundle standalone,
# como imagens e ícones que são servidos diretamente.
COPY --from=builder /app/public ./public

# A porta que a aplicação Next.js irá escutar.
EXPOSE 3000

# Define o comando para iniciar a aplicação Next.js.
# 'node server.js' é o comando padrão para iniciar uma aplicação Next.js standalone
# quando o 'server.js' está na raiz do diretório de trabalho.
CMD ["node", "server.js"]
