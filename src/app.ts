// src/app.ts
import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { open } from 'sqlite';
import * as sqlite3 from 'sqlite3'; // Importa sqlite3 de forma completa
import bodyParser from 'body-parser';

// Importa tus modelos y controladores (asegúrate de que las rutas sean correctas)
import { ContactsModel } from './models/contactsModel';
import { ContactsController } from './controllers/contactsController';
import { PaymentController } from './controllers/paymentController';

const app: express.Application = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Configurar el motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos (CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear datos enviados por formularios
app.use(express.urlencoded({ extended: true }));

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

    // Instancia el modelo de contactos y crea la tabla si no existe
    const contactsModel = new ContactsModel(db);
    await contactsModel.init();

    // Instanciar los controladores
    const contactsController = new ContactsController(contactsModel);
    const paymentController = new PaymentController();

    // Rutas para el formulario de contacto
    app.get('/contact', (req: Request, res: Response): void => {
      res.render('contactForm'); // Asegúrate de que existe la vista contactForm.ejs
    });

    app.post('/contact/add', (req: Request, res: Response): Promise<void> => contactsController.add(req, res));
    
    app.get('/contact/success', (req: Request, res: Response): void => {
      res.render('contactSuccess');
    });

    // Ruta para administrar y visualizar los contactos almacenados
    app.get('/admin/contacts', (req: Request, res: Response): Promise<void> => contactsController.index(req, res));

    // Rutas para el formulario de pago
    app.get('/payment', (req: Request, res: Response): void => {
      res.render('paymentForm'); // Asegúrate de que existe la vista paymentForm.ejs
    });

    app.post('/payment/add', (req: Request, res: Response): Promise<void> => paymentController.add(req, res));

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