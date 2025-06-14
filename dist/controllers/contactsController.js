"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsController = void 0;
class ContactsController {
    constructor(model) {
        this.model = model;
    }
    add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, names, comment } = req.body;
            // Validar que todos los campos se hayan enviado
            if (!email || !names || !comment) {
                res.status(400).send('Todos los campos son requeridos.');
                return;
            }
            // Obtener la IP del usuario; se usa req.ip y se valida con un fallback en req.socket.remoteAddress
            const ip = req.ip || req.socket.remoteAddress || '';
            // Registrar la fecha y hora actual
            const created_at = new Date().toISOString();
            const newContact = { email, names, comment, ip, created_at };
            try {
                yield this.model.addContact(newContact);
                res.redirect('/contact/success');
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Error al guardar el contacto.');
            }
        });
    }
    index(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contacts = yield this.model.getContacts();
                res.render('adminContacts', { contacts });
            }
            catch (error) {
                console.error(error);
                res.status(500).send('Error al recuperar los contactos.');
            }
        });
    }
}
exports.ContactsController = ContactsController;
