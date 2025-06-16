// src/controllers/contactsController.ts
import express from 'express';
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

  private getClientIP(req: express.Request): string {
    return req.ip || 
           req.socket.remoteAddress || 
           req.headers['x-forwarded-for']?.toString().split(',')[0] || 
           'Desconocido';
  }

  private async getCountryFromIP(ip: string): Promise<string> {
    try {
      // No consultar para IPs locales
      if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
        return 'Local';
      }

      // Limpiar la IP de posibles caracteres no deseados
      const cleanIP = ip.replace(/[^0-9.:]/g, '');
      
      // Verificar si la IP es válida
      if (!cleanIP || !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(cleanIP)) {
        console.log('IP inválida:', ip);
        return 'Desconocido';
      }

      // Usar ipapi.co para obtener la información del país
      const response = await fetch(`https://ipapi.co/${cleanIP}/json/`, {
        headers: {
          'User-Agent': 'PixelCrafters Contact Form'
        },
        timeout: 5000 // 5 segundos de timeout
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta de geolocalización:', data);

      if (data.error) {
        console.error('Error en la respuesta de geolocalización:', data.error);
        return 'Desconocido';
      }

      // Devolver el nombre del país en español si está disponible
      const countryName = data.country_name || 'Desconocido';
      
      // Registrar información adicional para debugging
      console.log('Geolocalización exitosa:', {
        ip: cleanIP,
        country: countryName,
        city: data.city,
        region: data.region,
        timezone: data.timezone
      });

      return countryName;
    } catch (error) {
      console.error('Error al obtener el país:', error);
      // En caso de error, intentar una segunda vez después de un breve delay
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();
        return data.country_name || 'Desconocido';
      } catch (retryError) {
        console.error('Error en el reintento de geolocalización:', retryError);
        return 'Desconocido';
      }
    }
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

  async add(req: express.Request, res: express.Response): Promise<void> {
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

      // Obtener IP y país
      const ip = this.getClientIP(req);
      console.log('IP detectada:', ip);

      let country = 'Desconocido';
      if (ip && ip !== '::1' && ip !== '127.0.0.1') {
        try {
          country = await this.getCountryFromIP(ip);
          console.log('País detectado:', country);
        } catch (geoError) {
          console.error('Error al obtener el país:', geoError);
          // Continuar con el proceso incluso si falla la geolocalización
        }
      } else {
        country = 'Local';
      }

      const now = new Date();
      const created_at = now.toISOString();

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

      // Enviar correo de notificación con información adicional
      try {
        await this.emailService.sendContactNotification(contact);
        console.log('Notificación por correo enviada exitosamente');
      } catch (emailError) {
        console.error('Error al enviar la notificación por correo:', emailError);
        // No interrumpimos el flujo si falla el envío del correo
      }

      res.redirect('/contact/success');
    } catch (error) {
      console.error('Error al guardar el contacto:', error);
      res.status(500).send('Error al guardar el contacto');
    }
  }

  async index(req: express.Request, res: express.Response): Promise<void> {
    try {
      // Verificar si el usuario está autenticado y es admin
      if (!req.user || (req.user as any).username !== 'admin') {
        res.render('adminContacts', {
          contacts: [],
          error: 'Necesitas iniciar sesión como administrador para acceder a esta página.',
          isAdmin: false
        });
        return;
      }

      const contacts = await this.model.getAllContacts();
      res.render('adminContacts', {
        contacts,
        isAdmin: true
      });
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      res.status(500).send('Error al recuperar los contactos');
    }
  }

  async deleteAll(req: express.Request, res: express.Response): Promise<void> {
    try {
      // Verificar si el usuario está autenticado y es admin
      if (!req.user || (req.user as any).username !== 'admin') {
        res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
        return;
      }

      await this.model.deleteAllContacts();
      res.redirect('/admin/contacts');
    } catch (error) {
      console.error('Error al eliminar contactos:', error);
      res.status(500).send('Error al eliminar los contactos');
    }
  }
}