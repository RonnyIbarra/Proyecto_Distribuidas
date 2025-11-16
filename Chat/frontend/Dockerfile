# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json .
RUN npm install

COPY src ./src
COPY public ./public

RUN npm run build


FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html


RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:3000; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
