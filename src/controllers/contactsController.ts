// src/controllers/contactsController.ts
import { Request, Response } from 'express';
import { ContactsModel, Contact } from '../models/contactsModel';

export class ContactsController {
  private model: ContactsModel;

  constructor(model: ContactsModel) {
    this.model = model;
  }

  private getClientIP(req: Request): string {
    // Intentar obtener la IP real del cliente
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // Si hay múltiples IPs, tomar la primera (la del cliente)
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
      return ips.trim();
    }
    
    // Si no hay IP en el header, usar la IP directa
    return req.ip || req.socket.remoteAddress || 'IP Desconocida';
  }

  private formatDateTime(date: Date): string {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Mexico_City' // Ajustar según la zona horaria deseada
    });
  }

  async add(req: Request, res: Response): Promise<void> {
    const { email, names, subject, comment } = req.body;

    // Validar que todos los campos se hayan enviado
    if (!email || !names || !subject || !comment) {
      res.status(400).send('Todos los campos son requeridos.');
      return;
    }

    // Obtener la IP del cliente
    const ip: string = this.getClientIP(req);

    // Registrar la fecha y hora actual con formato localizado
    const now = new Date();
    const created_at: string = this.formatDateTime(now);

    const newContact: Contact = { 
      email, 
      names, 
      subject, 
      comment, 
      ip, 
      created_at 
    };

    try {
      await this.model.addContact(newContact);
      res.redirect('/contact/success');
    } catch (error) {
      console.error('Error al guardar el contacto:', error);
      res.status(500).send('Error al guardar el contacto.');
    }
  }

  async index(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await this.model.getContacts();
      // Ordenar los contactos por fecha de creación (más recientes primero)
      contacts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      res.render('adminContacts', { contacts });
    } catch (error) {
      console.error('Error al recuperar los contactos:', error);
      res.status(500).send('Error al recuperar los contactos.');
    }
  }
}