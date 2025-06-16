// src/app.ts
import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { open } from 'sqlite';
import * as sqlite3 from 'sqlite3'; // Importa sqlite3 de forma completa
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from './config/passport';
import { UserModel } from './models/User';
import authRoutes from './routes/auth';
import expressLayouts from 'express-ejs-layouts';

// Importa tus modelos y controladores (asegúrate de que las rutas sean correctas)
import { ContactsModel } from './models/contactsModel';
import { ContactsController } from './controllers/contactsController';
import { PaymentController } from './controllers/paymentController';
import { PaymentModel } from './models/paymentModel';

const app: express.Application = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Configuración de la base de datos
const db = new sqlite3.Database(process.env.DATABASE_URL || './database.sqlite');
app.set('db', db);

// Configurar el motor de vistas EJS
app.set('view engine', 'ejs');
const viewsPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'views')
  : path.join(__dirname, '..', 'src', 'views');
app.set('views', viewsPath);
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Servir archivos estáticos (CSS, imágenes, etc.)
const publicPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '..', 'src', 'public');
app.use(express.static(publicPath));

// Middleware para parsear datos enviados por formularios
app.use(express.urlencoded({ extended: true }));

// Configuración de middleware
app.use(express.json());

// Middleware para pasar el usuario a todas las vistas
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.locals.user = req.user;
    next();
});

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'tu_secreto_super_seguro_aqui',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Renueva la sesión con cada petición
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        httpOnly: true, // Previene acceso desde JavaScript
        sameSite: 'strict', // Protección contra CSRF
        maxAge: 15 * 60 * 1000 // 15 minutos de inactividad
    }
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de Passport
const userModel = new UserModel(db);
configurePassport(userModel);

// Ruta principal: carga tu sitio base (index.ejs)
app.get('/', (req: Request, res: Response): void => {
  res.render('index');
});

// Función asíncrona para inicializar la base de datos y configurar las rutas adicionales
async function initDbAndRoutes(): Promise<void> {
  try {
    // Abrir (o crear) la base de datos SQLite
    const db = await open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database,
    });

    // Inicializar modelos
    const contactsModel = new ContactsModel(db);
    const paymentModel = new PaymentModel(db);
    await contactsModel.init();
    await paymentModel.init();

    // Inicializar controladores
    const contactsController = new ContactsController(contactsModel);
    const paymentController = new PaymentController(paymentModel);

    // Rutas públicas
    app.get('/', (req, res) => res.render('index'));
    app.get('/contact', (req, res) => res.render('contactForm'));
    app.get('/contact/success', (req, res) => res.render('contactSuccess'));
    app.get('/payment', (req, res) => res.render('paymentForm'));
    app.post('/contact/add', (req, res) => contactsController.add(req, res));
    app.post('/payment/add', (req, res) => paymentController.add(req, res));

    // Rutas protegidas de administración
    app.get('/admin/contacts', (req, res) => contactsController.index(req, res));
    app.post('/admin/contacts/delete-all', (req, res) => contactsController.deleteAll(req, res));
    app.get('/admin/payments', (req, res) => paymentController.index(req, res));
    app.get('/admin/payments/search', (req, res) => paymentController.search(req, res));

    // Rutas de autenticación
    app.use('/auth', authRoutes);

    // Iniciar el servidor
    app.listen(PORT, (): void => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Error al iniciar la base de datos y configurar rutas:", error);
  }
}

// Inicializa la base de datos y configura las rutas adicionales
initDbAndRoutes();

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});