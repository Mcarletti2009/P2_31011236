import nodemailer from 'nodemailer';
import { Contact } from '../types/contact';

export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly recipients: string[] = ['programacion2ais@yopmail.com'];

    constructor() {
        // Configurar el transporter usando Gmail
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendContactNotification(contactData: Contact): Promise<void> {
        const { names, email, subject, comment, ip, country, created_at } = contactData;

        // Asegurarse de que country no sea undefined
        const countryDisplay = country || 'Desconocido';

        // Crear el contenido HTML del correo
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Nuevo Mensaje de Contacto</h2>
                
                <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
                    <p style="margin: 5px 0;"><strong>Fecha y Hora:</strong> ${created_at}</p>
                    <p style="margin: 5px 0;"><strong>Nombres:</strong> ${names}</p>
                    <p style="margin: 5px 0;"><strong>Correo Electrónico:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p style="margin: 5px 0;"><strong>Asunto:</strong> ${subject}</p>
                    <p style="margin: 5px 0;"><strong>IP del Cliente:</strong> ${ip}</p>
                    <p style="margin: 5px 0;"><strong>País:</strong> ${countryDisplay}</p>
                </div>

                <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    <h3 style="color: #444; margin-top: 0;">Mensaje:</h3>
                    <p style="white-space: pre-wrap; margin: 0;">${comment}</p>
                </div>

                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                    <p>Este es un correo automático generado por el sistema de contacto de PixelCrafters.</p>
                </div>
            </div>
        `;

        // Configurar el correo
        const mailOptions = {
            from: `"PixelCrafters Contacto" <${process.env.EMAIL_USER}>`,
            to: this.recipients.join(', '),
            subject: `Nuevo Mensaje de Contacto: ${subject}`,
            html: htmlContent,
            replyTo: email // Permitir responder directamente al remitente
        };

        try {
            // Enviar el correo
            await this.transporter.sendMail(mailOptions);
            console.log('Correo de notificación enviado exitosamente');
        } catch (error) {
            console.error('Error al enviar el correo de notificación:', error);
            throw new Error('No se pudo enviar el correo de notificación');
        }
    }
} 