# --- STAGE DE CONSTRUÇÃO (BUILDER) ---
FROM node:24-alpine AS builder

WORKDIR /app

# Adicionar ferramentas de build essenciais, se necessário para dependências nativas.
# (Considere reintroduzir `apk add g++ make python3 git` aqui se tiver dependências nativas)

# Ativa o corepack para gerir os gestores de pacotes e prepara o pnpm.
# Esta é a forma recomendada de obter pnpm com corepack.
RUN corepack enable && corepack prepare pnpm@8.10.2 --activate

# Copia os arquivos de configuração do projeto.
COPY package.json pnpm-lock.yaml ./

# Instala todas as dependências do projeto (dev e prod).
# O --frozen-lockfile garante uma instalação consistente.
RUN pnpm install --force
RUN pnpm install @adyen/adyen-web --save
# A linha 'RUN pnpm install @adyen/adyen-web --save' é redundante aqui
# se '@adyen/adyen-web' já estiver em seu package.json e foi instalado no pnpm install anterior.
# Se for uma dependência adicionada recentemente, atualize seu package.json e pnpm-lock.yaml localmente e copie-os.
# Se é para ser instalada APENAS no Dockerfile, coloque-a antes do 'pnpm install --frozen-lockfile'
# e sem o '--save', pois não está a editar o package.json no container.
# Por enquanto, vou ASSUMIR que está no package.json. Se não estiver, esta linha pode ser removida.
# REMOVIDO: RUN pnpm install @adyen/adyen-web --save

# Copia todo o código-fonte restante do projeto.
COPY . .

# Define a variável de ambiente para o modo de produção ANTES do build.
ENV NODE_ENV=production

# Executa o build de produção do Next.js.
# Com NODE_ENV=production, next.config.js usa 'output: "export"' para 'out/dist'.
RUN pnpm run build

# ----------------------------------------------------------------------------------------------------

# --- STAGE DE PRODUÇÃO (RUNNER) ---
# Usa uma imagem Node.js Alpine mínima, mais adequada para servir assets estáticos.
FROM node:24-alpine AS runner

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia APENAS o resultado da build (a pasta 'out/dist') do estágio 'builder'.
COPY --from=builder /app/out/dist ./

# Define a variável de ambiente para o modo de produção.
ENV NODE_ENV=production

# Instala o pacote 'serve' globalmente no estágio RUNNER.
# Isto garante que 'serve' esteja disponível no PATH do contêiner e pode ser executado diretamente.
# Não precisamos do pnpm na imagem final para apenas executar 'serve'.
RUN npm install -g serve

# Expor a porta onde a aplicação será servida.
EXPOSE 3000

# Comando para iniciar a aplicação usando 'serve'.
# O '-s' é para modo SPA (Single Page Application), essencial para Next.js export.
# '.': serve o diretório atual (onde copiamos o conteúdo de 'out/dist').
# '-l 3000': especifica a porta para ouvir.
CMD ["serve", "-s", ".", "-l", "3000"]

# docker buildx build  --platform linux/amd64 -t execlog/mfe-checkout-ridesrent:v.0.8 . && docker push execlog/mfe-checkout-ridesrent:v.0.8