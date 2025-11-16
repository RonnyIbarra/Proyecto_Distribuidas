FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package.json .

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src ./src

# Crear directorio de uploads
RUN mkdir -p /app/uploads

# Exponer puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "start"]
