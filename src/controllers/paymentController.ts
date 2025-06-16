import express from 'express';
import { PaymentModel, Payment } from '../models/paymentModel';

export class PaymentController {
    private model: PaymentModel;

    constructor(model: PaymentModel) {
        this.model = model;
    }

    async add(req: express.Request, res: express.Response): Promise<void> {
        try {
            const { service, amount } = req.body;
            const payment_date = new Date().toISOString();
            const payment_status = 'completed'; // Simulamos que todos los pagos son exitosos
            const created_at = new Date().toISOString();

            await this.model.addPayment({
                service,
                amount: parseFloat(amount),
                payment_date,
                payment_status,
                created_at
            });

            res.redirect('/payment/success');
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            res.status(500).send('Error al procesar el pago');
        }
    }

    async index(req: express.Request, res: express.Response): Promise<void> {
        try {
            // Verificar si el usuario está autenticado y es admin
            if (!req.user || (req.user as any).username !== 'admin') {
                res.render('adminPayments', {
                    payments: [],
                    error: 'Necesitas iniciar sesión como administrador para acceder a esta página.',
                    isAdmin: false
                });
                return;
            }

            const payments = await this.model.getAllPayments();
            res.render('adminPayments', {
                payments,
                isAdmin: true
            });
        } catch (error) {
            console.error('Error al obtener pagos:', error);
            res.status(500).send('Error al recuperar los pagos');
        }
    }

    async search(req: express.Request, res: express.Response): Promise<void> {
        try {
            if (!req.user || (req.user as any).username !== 'admin') {
                res.status(403).json({ error: 'No autorizado' });
                return;
            }

            const { startDate, endDate, service, status } = req.query;
            let payments: Payment[] = [];

            if (startDate && endDate) {
                payments = await this.model.getPaymentsByDateRange(
                    startDate as string,
                    endDate as string
                );
            } else if (service) {
                payments = await this.model.getPaymentsByService(service as string);
            } else if (status) {
                payments = await this.model.getPaymentsByStatus(status as string);
            } else {
                payments = await this.model.getAllPayments();
            }

            res.json(payments);
        } catch (error) {
            console.error('Error en la búsqueda de pagos:', error);
            res.status(500).json({ error: 'Error al buscar pagos' });
        }
    }
}