import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';

export interface Payment {
    id: number;
    service: string;
    amount: number;
    payment_date: string;
    payment_status: string;
    created_at: string;
}

export class PaymentModel {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async init(): Promise<void> {
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service TEXT NOT NULL,
                amount REAL NOT NULL,
                payment_date TEXT NOT NULL,
                payment_status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        `);
    }

    async addPayment(payment: Omit<Payment, 'id'>): Promise<void> {
        const { service, amount, payment_date, payment_status, created_at } = payment;
        await this.db.run(
            `INSERT INTO payments (service, amount, payment_date, payment_status, created_at) 
             VALUES (?, ?, ?, ?, ?)`,
            [service, amount, payment_date, payment_status, created_at]
        );
    }

    async getAllPayments(): Promise<Payment[]> {
        return await this.db.all(`SELECT * FROM payments ORDER BY created_at DESC`);
    }

    async getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
        return await this.db.all(
            `SELECT * FROM payments 
             WHERE payment_date BETWEEN ? AND ? 
             ORDER BY payment_date DESC`,
            [startDate, endDate]
        );
    }

    async getPaymentsByService(service: string): Promise<Payment[]> {
        return await this.db.all(
            `SELECT * FROM payments 
             WHERE service LIKE ? 
             ORDER BY created_at DESC`,
            [`%${service}%`]
        );
    }

    async getPaymentsByStatus(status: string): Promise<Payment[]> {
        return await this.db.all(
            `SELECT * FROM payments 
             WHERE payment_status = ? 
             ORDER BY created_at DESC`,
            [status]
        );
    }
} 