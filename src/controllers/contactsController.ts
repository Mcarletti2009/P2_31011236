// src/controllers/contactsController.ts
import { Request, Response } from 'express';
import { ContactsModel, Contact } from '../models/contactsModel';

export class ContactsController {
  private model: ContactsModel;

  constructor(model: ContactsModel) {
    this.model = model;
  }

  async add(req: Request, res: Response): Promise<void> {
    const { email, names, comment } = req.body;

    // Validar que todos los campos se hayan enviado
    if (!email || !names || !comment) {
      res.status(400).send('Todos los campos son requeridos.');
      return;
    }

    // Obtener la IP del usuario; se usa req.ip y se valida con un fallback en req.socket.remoteAddress
    const ip: string = req.ip || req.socket.remoteAddress || '';

    // Registrar la fecha y hora actual
    const created_at: string = new Date().toISOString();

    const newContact: Contact = { email, names, comment, ip, created_at };

    try {
      await this.model.addContact(newContact);
      res.redirect('/contact/success');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al guardar el contacto.');
    }
  }

  async index(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await this.model.getContacts();
      res.render('adminContacts', { contacts });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al recuperar los contactos.');
    }
  }
}