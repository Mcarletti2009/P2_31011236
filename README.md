# PixelCrafters - Sistema de Contacto

Sistema de gestión de contactos con geolocalización por IP, autenticación de administradores y notificaciones por correo electrónico.

## Características

- Formulario de contacto con validación reCAPTCHA
- Geolocalización automática por IP
- Panel de administración protegido
- Notificaciones por correo electrónico
- Interfaz responsiva y moderna
- Base de datos SQLite
- Autenticación de administradores

## Requisitos

- Node.js (v14 o superior)
- npm (v6 o superior)
- Cuenta de correo electrónico para las notificaciones
- Claves de reCAPTCHA
- Claves de GitHub OAuth (opcional)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/pixelcrafters.git
cd pixelcrafters
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
# Configuración del servidor
PORT=3000
SESSION_SECRET=tu_secreto_sesion

# Configuración de correo
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_app

# Configuración reCAPTCHA
RECAPTCHA_SITE_KEY=tu_site_key
RECAPTCHA_SECRET_KEY=tu_secret_key

# Configuración GitHub OAuth (opcional)
GITHUB_CLIENT_ID=tu_client_id
GITHUB_CLIENT_SECRET=tu_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

4. Inicializar la base de datos y crear el usuario administrador:
```bash
npm run init-admin
```

5. Iniciar el servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Estructura del Proyecto

```
pixelcrafters/
├── src/
│   ├── controllers/     # Controladores de la aplicación
│   ├── models/         # Modelos de datos
│   ├── services/       # Servicios (email, etc.)
│   ├── views/          # Plantillas EJS
│   ├── public/         # Archivos estáticos
│   └── app.ts          # Punto de entrada
├── dist/               # Código compilado
├── .env               # Variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## Uso

1. Acceder al formulario de contacto en `/contact`
2. Completar el formulario y pasar la verificación reCAPTCHA
3. El sistema detectará automáticamente la ubicación del visitante
4. Se enviará una notificación por correo al administrador
5. Acceder al panel de administración en `/admin/contacts` (requiere autenticación)

## Seguridad

- Protección contra spam con reCAPTCHA
- Autenticación segura de administradores
- Sesiones con cookies seguras
- Validación de datos en el servidor
- Protección contra inyección SQL
- Geolocalización con validación de IP

## Contribuir

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter)

Link del Proyecto: [https://github.com/tu-usuario/pixelcrafters](https://github.com/tu-usuario/pixelcrafters) 