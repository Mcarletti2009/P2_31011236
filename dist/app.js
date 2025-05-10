"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const sqlite_1 = require("sqlite");
const sqlite3 = __importStar(require("sqlite3")); // Importa sqlite3 de forma completa
// Importa tus modelos y controladores (asegúrate de que las rutas sean correctas)
const contactsModel_1 = require("./models/contactsModel");
const contactsController_1 = require("./controllers/contactsController");
const paymentController_1 = require("./controllers/paymentController");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Configurar el motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../src/views'));
// Servir archivos estáticos (CSS, imágenes, etc.)
app.use(express_1.default.static(path_1.default.join(__dirname, '../src/public')));
// Middleware para parsear datos enviados por formularios
app.use(express_1.default.urlencoded({ extended: true }));
// Ruta principal: carga tu sitio base (index.ejs)
app.get('/', (req, res) => {
    res.render('index');
});
// Función asíncrona para inicializar la base de datos y configurar las rutas adicionales
function initDbAndRoutes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Abrir (o crear) la base de datos SQLite
            const db = yield (0, sqlite_1.open)({
                filename: path_1.default.join(__dirname, '../src/database.sqlite'),
                driver: sqlite3.Database,
            });
            // Instancia el modelo de contactos y crea la tabla si no existe
            const contactsModel = new contactsModel_1.ContactsModel(db);
            yield contactsModel.init();
            // Instanciar los controladores
            const contactsController = new contactsController_1.ContactsController(contactsModel);
            const paymentController = new paymentController_1.PaymentController();
            // Rutas para el formulario de contacto
            app.get('/contact', (req, res) => {
                res.render('contactForm'); // Asegúrate de que existe la vista contactForm.ejs
            });
            app.post('/contact/add', (req, res) => contactsController.add(req, res));
            app.get('/contact/success', (req, res) => {
                res.send("Contacto agregado exitosamente");
            });
            // Ruta para administrar y visualizar los contactos almacenados
            app.get('/admin/contacts', (req, res) => contactsController.index(req, res));
            // Rutas para el formulario de pago
            app.get('/payment', (req, res) => {
                res.render('paymentForm'); // Asegúrate de que existe la vista paymentForm.ejs
            });
            app.post('/payment/add', (req, res) => paymentController.add(req, res));
            // Iniciar el servidor
            app.listen(PORT, () => {
                console.log(`Servidor corriendo en http://localhost:${PORT}`);
            });
        }
        catch (error) {
            console.error("Error al iniciar la base de datos y configurar rutas:", error);
        }
    });
}
// Inicializa la base de datos y configura las rutas adicionales
initDbAndRoutes();
