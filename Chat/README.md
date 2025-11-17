# 🔐 Sistema de Chat en Tiempo Real con Salas Seguras

Sistema de chat moderno y seguro desarrollado para la Universidad ESPE - Carrera de Ingeniería en Software.

## 📋 Descripción General

Aplicativo web que permite la gestión de salas de conversación seguras y colaborativas. Los administradores pueden crear salas con acceso controlado mediante PINs, y los usuarios se conectan mediante nicknames únicos. El sistema implementa:

- ✅ Autenticación de administrador con JWT
- ✅ Salas de chat (Texto y Multimedia)
- ✅ Comunicación en tiempo real con WebSockets
- ✅ Manejo de concurrencia con Threads
- ✅ Subida y visualización de archivos
- ✅ Sesión única por dispositivo
- ✅ Lista de usuarios conectados

## 🛠 Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **Socket.io** - Comunicación en tiempo real
- **bcryptjs** - Hashing de contraseñas y PINs
- **JWT** - Autenticación de administrador
- **Multer** - Manejo de subidas de archivos

### Frontend
- **React** - Librería UI
- **React Router** - Navegación
- **Socket.io Client** - Cliente WebSocket
- **Axios** - Cliente HTTP

### Base de Datos
- En memoria (producción usar MongoDB o PostgreSQL)

## 🚀 Instalación

### Requisitos
- Node.js >= 14.0
- npm >= 6.0

### Backend

```bash
# 1. Navegar a la carpeta del backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Copiar archivo de configuración
cp .env.example .env

# 4. Editar .env si es necesario (credenciales por defecto: admin/admin123)

# 5. Ejecutar servidor
npm start

# O en modo desarrollo con auto-reload
npm run dev

# Para ejecutar pruebas
npm test

# Para pruebas con cobertura
npm test -- --coverage
```

El servidor estará disponible en `http://localhost:3000`

### Frontend

```bash
# 1. Navegar a la carpeta del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env (opcional, usa localhost por defecto)
echo "REACT_APP_API_URL=http://localhost:3000/api" > .env.local
echo "REACT_APP_SOCKET_URL=http://localhost:3000" >> .env.local

# 4. Ejecutar aplicación
npm start

# O construir para producción
npm run build
```

La aplicación estará disponible en `http://localhost:3000`

## 📖 Uso

### 1. Panel de Administración

```
URL: http://localhost:3000/admin
Usuario por defecto: admin
Contraseña por defecto: admin123
```

**Funcionalidades:**
- Crear nuevas salas de chat
- Seleccionar tipo (Texto o Multimedia)
- Generar PIN seguro
- Ver salas activas y cantidad de usuarios
- Eliminar salas

### 2. Acceso como Usuario

```
URL: http://localhost:3000/join
```

**Pasos:**
1. Seleccionar sala disponible
2. Ingresar PIN de acceso
3. Elegir un nickname único
4. Entrar a la sala

### 3. Interfaz de Chat

**Características:**
- Envío y recepción de mensajes en tiempo real
- Ver usuarios conectados
- Ver cuando alguien está escribiendo
- Subir archivos (solo salas multimedia)
- Descargar archivos compartidos
- Salir de la sala

## 📊 Requisitos Funcionales Implementados

### 1. Autenticación del Administrador ✅
- Login con usuario y contraseña
- Generación de JWT tokens
- Validación segura de credenciales

### 2. Creación de Salas ✅
- ID único generado automáticamente (UUID v4)
- PINs de al menos 4 dígitos, encriptados con bcrypt
- Dos tipos: Texto y Multimedia
- Almacenamiento en memoria escalable

### 3. Acceso de Usuarios ✅
- Acceso anónimo mediante PIN y nickname
- Validación de unicidad de nicknames por sala
- Sesión única por dispositivo (IP)
- Manejo de errores informativo

### 4. Comunicación en Tiempo Real ✅
- Envío y recepción de mensajes vía WebSocket
- Broadcast a todos los usuarios en la sala
- Indicador de usuario escribiendo
- Lista actualizada de usuarios

### 5. Funcionalidades Multimedia ✅
- Subida de archivos (imágenes, PDFs)
- Validación de tamaño (máximo 10MB)
- Validación de tipo de archivo
- Descarga de archivos compartidos

### 6. Gestion de Concurrencia ✅
- WebSockets nativos de Node.js
- Manejo de múltiples conexiones simultáneas
- Broadcasting sin bloqueos
- Escalable para 50+ usuarios por sala

## 📈 Requisitos No Funcionales

### Tiempo Real ✅
- Latencia < 1 segundo
- Actualizaciones instantáneas

### Escalabilidad ✅
- Soporta 50+ usuarios simultáneos por sala
- Arquitectura preparada para clustering

### Seguridad ✅
- PINs hasheados con bcrypt
- Autenticación JWT
- Validación de entrada
- Prevención de inyecciones

### Responsividad ✅
- Diseño adaptable a dispositivos móviles
- Interfaz intuitiva

## 🧪 Pruebas Unitarias

Se incluyen pruebas para:
- **AuthService** - Autenticación y JWT
- **RoomService** - Creación y gestión de salas
- **MessageService** - Validación y almacenamiento de mensajes

Cobertura mínima: 70%

```bash
###Ejecutar pruebas
npm test
npm test -- --coverage
```
**![Image](https://github.com/user-attachments/assets/522a7ad5-a835-450e-910a-17bd404a98e4)**
**![Image](https://github.com/user-attachments/assets/0485469e-d617-48b4-a03a-1c2287882e4b)**


## 🏗 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cliente Web (Frontend)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │  LoginAdmin  │  │  JoinRoom    │  │   ChatRoom       │      │
│  │  (React)     │  │  (React)     │  │   (React)        │      │
│  └──────────────┘  └──────────────┘  └──────────────────┘      │
│         ↓                  ↓                    ↓                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            Socket.io Client + API Client                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↓ HTTP/WebSocket                              ↑
         ↓                                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Servidor Node.js (Backend)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Express.js                           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐    │  │
│  │  │ API Routes │  │ Auth Mw    │  │ File Upload    │    │  │
│  │  │ /api/*     │  │ Validar JWT│  │ Multer + File  │    │  │
│  │  └────────────┘  └────────────┘  └────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↑                                       │
│                    ┌─────────────┐                              │
│                    │  Socket.io  │                              │
│                    │  (Real-time)│                              │
│                    └─────────────┘                              │
│                          ↑                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Servicios                             │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │  │
│  │  │ AuthService│  │RoomService │  │ MessageService   │  │  │
│  │  │ JWT + bcry │  │Crear/Lista │  │ Validar/Guardar  │  │  │
│  │  └────────────┘  └────────────┘  └──────────────────┘  │  │
│  │  ┌────────────┐                                         │  │
│  │  │FileService │                                         │  │
│  │  │ Upload/DL  │                                         │  │
│  │  └────────────┘                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Datos en Memoria                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │  │
│  │  │  Salas     │  │ Mensajes   │  │ Usuarios Session │  │  │
│  │  │  (ChatRoom)│  │ (Messages) │  │ (Map)            │  │  │
│  │  └────────────┘  └────────────┘  └──────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Sistema de Archivos (uploads/)               │  │
│  │  Almacenamiento temporal de archivos compartidos         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Diagrama de Secuencia - Login Administrador

```
Admin                   Frontend                Backend
 │                         │                        │
 ├─────(1) Click Login─────>│                        │
 │                         │                        │
 │                     (2) Ingresa credenciales    │
 │                         │                        │
 │                         ├─────POST /api/login──>│
 │                         │  (user, password)     │
 │                         │                        │
 │                         │  (3) Valida credenciales
 │                         │      bcrypt.compare()  │
 │                         │                        │
 │                         │<─JWT + Username────────│
 │                         │                        │
 │<─────Redirect a Panel───│                        │
 │                         │                        │
 │     (4) Token guardado en localStorage          │
```

## 📋 Diagrama de Secuencia - Comunicación en Tiempo Real

```
Usuario1                WebSocket              Usuario2
   │                        │                      │
   │──────(1) join-room────>│                      │
   │                        │──emit('user-joined')>│
   │                        │  (lista usuarios)    │
   │                        │                      │
   │  (2) send-message ────>│                      │
   │   "Hola mundo"         │──receive-message───>│
   │                        │                      │
   │                        │<─user-typing────────│
   │<─user-typing───────────│                      │
   │                        │                      │
   │                    (3) Broadcast a todos     │
   │<─receive-message───────│──receive-message───>│
   │   "Hola mundo"         │   "Hola mundo"       │
   │                        │                      │
```

## 📁 Estructura del Proyecto

```
Chat/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Admin.js
│   │   │   └── ChatRoom.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── roomService.js
│   │   │   ├── messageService.js
│   │   │   └── fileService.js
│   │   ├── routes/
│   │   │   └── api.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   └── server.js
│   ├── tests/
│   │   ├── authService.test.js
│   │   ├── roomService.test.js
│   │   └── messageService.test.js
│   ├── uploads/
│   ├── package.json
│   ├── jest.config.js
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginAdmin.js
│   │   │   ├── AdminPanel.js
│   │   │   ├── JoinRoom.js
│   │   │   └── ChatRoom.js
│   │   ├── components/
│   │   ├── services/
│   │   │   ├── apiService.js
│   │   │   └── socketService.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── RoomContext.js
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   └── pages.css
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── tsconfig.json
│   ├── .gitignore
│   └── .env.example
└── README.md
```

## 🐳 Despliegue con Docker (Opcional)

Crear archivos:

**backend/Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
```

**frontend/Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package.json .
RUN npm install
COPY src ./src
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (rounds: 10)
- ✅ PINs hasheados con bcrypt
- ✅ JWT para autenticación
- ✅ CORS configurado
- ✅ Validación de entrada en cliente y servidor
- ✅ Sesión única por dispositivo/IP
- ✅ Límites en tamaño de archivo (10MB)
- ✅ Validación de tipos MIME

## 📊 Pruebas de Carga

Para probar la escalabilidad con 50+ usuarios simultáneos:

```bash
# Usar herramientas como Apache JMeter o Artillery
artillery quick --count 100 --num 10 http://localhost:3000/chat/test-room
```

## ✨ Características Futuras

- [ ] Base de datos persistente (MongoDB/PostgreSQL)
- [ ] Autenticación de usuarios
- [ ] Historial de chat en BD
- [ ] Emojis y reacciones
- [ ] Búsqueda de mensajes
- [ ] Temas personalizados
- [ ] Notificaciones push
- [ ] Encriptación de mensajes
- [ ] Roles de usuario

## 📝 Licencia

MIT

## 👥 Autor

Departamento de Ciencias de la Computación - ESPE
Carrera de Ingeniería en Software
Docente: Geovanny Cudco

---

**Versión:** 1.0.0
**Última actualización:** 15 de Noviembre de 2025
