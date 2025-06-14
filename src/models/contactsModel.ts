import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export interface Contact {
  email: string;
  names: string;
  subject: string;
  comment: string;
  ip: string;
  created_at: string;
}

export class ContactsModel {
  private db: Database<sqlite3.Database, sqlite3.Statement>;

  constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
    this.db = db;
  }

  async init(): Promise<void> {
    try {
      // Verificar si la columna subject existe
      const tableInfo = await this.db.all("PRAGMA table_info(contacts)");
      const hasSubjectColumn = tableInfo.some((col: any) => col.name === 'subject');

      if (!hasSubjectColumn) {
        // Si la tabla no existe, crearla con todas las columnas
        await this.db.exec(`
          CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            names TEXT,
            subject TEXT,
            comment TEXT,
            ip TEXT,
            created_at TEXT
          );
        `);
      } else {
        // Si la tabla existe pero no tiene la columna subject, agregarla
        await this.db.exec(`
          ALTER TABLE contacts ADD COLUMN subject TEXT;
        `);
      }
    } catch (error) {
      // Si la tabla no existe, crearla
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT,
          names TEXT,
          subject TEXT,
          comment TEXT,
          ip TEXT,
          created_at TEXT
        );
      `);
    }
  }

  async addContact(contact: Contact): Promise<void> {
    const { email, names, subject, comment, ip, created_at } = contact;
    await this.db.run(
      `INSERT INTO contacts (email, names, subject, comment, ip, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, names, subject, comment, ip, created_at]
    );
  }

  async getContacts(): Promise<any[]> {
    return await this.db.all(`SELECT * FROM contacts`);
  }
}