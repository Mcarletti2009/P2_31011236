// src/controllers/contactsController.ts
import { Request, Response } from 'express';
import { ContactsModel, Contact } from '../models/contactsModel';
import axios from 'axios';
import fetch from 'node-fetch';
import { EmailService } from '../services/emailService';

export class ContactsController {
  private model: ContactsModel;
  private emailService: EmailService;

  constructor(model: ContactsModel) {
    this.model = model;
    this.emailService = new EmailService();
  }

  private async getCountryFromIP(ip: string): Promise<string> {
    try {
      // Evitar consultas para IPs locales
      if (ip === '::1' || ip === '127.0.0.1') {
        return 'Local';
      }

      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      console.log('Respuesta de geolocalización:', data);

      if (data && data.country_name) {
        return data.country_name;
      }
      return 'Desconocido';
    } catch (error) {
      console.error('Error al obtener el país:', error);
      return 'Desconocido';
    }
  }

  private getClientIP(req: Request): string {
    // Obtener IP real incluso detrás de un proxy
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // x-forwarded-for puede contener múltiples IPs, tomamos la primera
      const ips = forwardedFor.toString().split(',');
      return ips[0].trim();
    }
    return req.ip || req.socket.remoteAddress || '0.0.0.0';
  }

  private formatDateTime(date: Date): string {
    return date.toLocaleString('es-ES', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private async verifyRecaptcha(token: string): Promise<boolean> {
    try {
      console.log('Verificando token reCAPTCHA:', token);
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=6LfzXWArAAAAAMsuzL9Pz0m1y6iGS-6Xu7n53S6n&response=${token}`
      });

      const data = await response.json();
      console.log('Respuesta de verificación reCAPTCHA:', data);
      return data.success;
    } catch (error) {
      console.error('Error al verificar reCAPTCHA:', error);
      return false;
    }
  }

  async add(req: Request, res: Response): Promise<void> {
    try {
      const { email, names, subject, comment, 'g-recaptcha-response': recaptchaToken } = req.body;
      console.log('Datos recibidos:', { email, names, subject, comment, recaptchaToken });

      // Verificar reCAPTCHA
      if (!recaptchaToken) {
        console.log('No se recibió token de reCAPTCHA');
        res.status(400).json({ error: 'Por favor, complete la verificación de seguridad' });
        return;
      }

      const isValidRecaptcha = await this.verifyRecaptcha(recaptchaToken);
      console.log('¿reCAPTCHA válido?:', isValidRecaptcha);

      if (!isValidRecaptcha) {
        console.log('Verificación de reCAPTCHA falló');
        res.status(400).json({ error: 'La verificación de seguridad ha fallado. Por favor, inténtelo de nuevo.' });
        return;
      }

      const ip = this.getClientIP(req);
      console.log('IP detectada:', ip);

      // Obtener el país basado en la IP
      let country = 'Desconocido';
      if (ip && ip !== '::1' && ip !== '127.0.0.1') {
        country = await this.getCountryFromIP(ip);
      } else {
        country = 'Local';
      }
      console.log('País detectado:', country);

      const now = new Date();
      const created_at = now.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const contact: Contact = {
        email,
        names,
        subject,
        comment,
        ip,
        country,
        created_at
      };

      console.log('Contacto a guardar:', contact);
      await this.model.addContact(contact);

      // Enviar correo de notificación
      try {
        await this.emailService.sendContactNotification(contact);
        console.log('Notificación por correo enviada exitosamente');
      } catch (emailError) {
        console.error('Error al enviar la notificación por correo:', emailError);
        // No interrumpimos el flujo si falla el envío del correo
      }

      // Redirigir a la página de éxito
      res.redirect('/contact/success');
    } catch (error) {
      console.error('Error al procesar el contacto:', error);
      res.status(500).json({ error: 'Error al procesar el contacto' });
    }
  }

  async index(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await this.model.getAllContacts();
      console.log('Contactos recuperados:', contacts); // Para debugging
      res.render('adminContacts', { contacts });
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      res.status(500).json({ error: 'Error al obtener los contactos' });
    }
  }
}