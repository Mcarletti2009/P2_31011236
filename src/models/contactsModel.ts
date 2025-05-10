import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export interface Contact {
  email: string;
  names: string;
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
    // Crea la tabla si no existe
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        names TEXT,
        comment TEXT,
        ip TEXT,
        created_at TEXT
      );
    `);
  }

  async addContact(contact: Contact): Promise<void> {
    const { email, names, comment, ip, created_at } = contact;
    await this.db.run(
      `INSERT INTO contacts (email, names, comment, ip, created_at) VALUES (?, ?, ?, ?, ?)`,
      [email, names, comment, ip, created_at]
    );
  }

  async getContacts(): Promise<any[]> {
    return await this.db.all(`SELECT * FROM contacts`);
  }
}