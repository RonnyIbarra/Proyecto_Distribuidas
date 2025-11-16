FROM node:20-alpine

WORKDIR /app

# Copia package.json
COPY package*.json ./

# Instala SOLO dependencias de producción (no necesitas nodemon)
RUN npm install --omit=dev

# Copia el código
COPY . .

EXPOSE 3000

# USA node DIRECTO (sin nodemon)
CMD ["node", "src/server.js"]