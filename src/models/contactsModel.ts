import { Database as SQLiteDatabase } from 'sqlite3';
import { Database } from 'sqlite';

interface TableInfo {
    name: string;
    type: string;
}

interface ColumnInfo {
    name: string;
    type: string;
}

export interface Contact {
    id?: number;
    email: string;
    names: string;
    subject: string;
    comment: string;
    ip: string;
    country?: string;
    created_at: string;
}

export class ContactsModel {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    async init(): Promise<void> {
        try {
            // Verificar si la tabla existe
            const tableExists = await this.db.get(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='contacts'"
            );

            if (!tableExists) {
                console.log('Creando tabla contacts con la estructura correcta...');
                await this.db.exec(`
                    CREATE TABLE contacts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email TEXT NOT NULL,
                        names TEXT NOT NULL,
                        subject TEXT NOT NULL,
                        comment TEXT NOT NULL,
                        country_ip TEXT NOT NULL,
                        created_at TEXT NOT NULL
                    )
                `);
                console.log('Tabla contacts creada con la estructura correcta');
            } else {
                // Verificar la estructura actual de la tabla
                const tableInfo = await this.db.all("PRAGMA table_info(contacts)");
                const columnNames = tableInfo.map(col => col.name);
                console.log('Columnas actuales:', columnNames);

                // Verificar si la estructura es correcta
                const expectedColumns = ['id', 'email', 'names', 'subject', 'comment', 'country_ip', 'created_at'];
                const hasCorrectStructure = expectedColumns.every(col => columnNames.includes(col));

                if (!hasCorrectStructure) {
                    console.log('Estructura incorrecta detectada, recreando tabla...');
                    // Crear tabla temporal con la estructura correcta
                    await this.db.exec(`
                        CREATE TABLE contacts_temp (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            email TEXT NOT NULL,
                            names TEXT NOT NULL,
                            subject TEXT NOT NULL,
                            comment TEXT NOT NULL,
                            country_ip TEXT NOT NULL,
                            created_at TEXT NOT NULL
                        )
                    `);

                    // Copiar datos existentes a la tabla temporal
                    await this.db.exec(`
                        INSERT INTO contacts_temp (email, names, subject, comment, country_ip, created_at)
                        SELECT email, names, subject, comment, 
                               CASE 
                                   WHEN country = 'Local' THEN ip
                                   ELSE country || ' (' || ip || ')'
                               END as country_ip,
                               created_at
                        FROM contacts
                    `);

                    // Eliminar tabla original y renombrar temporal
                    await this.db.exec(`
                        DROP TABLE contacts;
                        ALTER TABLE contacts_temp RENAME TO contacts;
                    `);
                    console.log('Tabla recreada con la estructura correcta');
                }
            }
        } catch (error) {
            console.error('Error al inicializar la base de datos:', error);
            throw error;
        }
    }

    async addContact(contact: Contact): Promise<void> {
        try {
            console.log('Guardando contacto:', contact);
            const country_ip = contact.country === 'Local' 
                ? contact.ip 
                : `${contact.country} (${contact.ip})`;

            const stmt = await this.db.prepare(`
                INSERT INTO contacts (email, names, subject, comment, country_ip, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            const result = await stmt.run(
                contact.email,
                contact.names,
                contact.subject,
                contact.comment,
                country_ip,
                contact.created_at
            );
            
            console.log('Resultado de inserción:', result);
            await stmt.finalize();
        } catch (error) {
            console.error('Error al guardar contacto:', error);
            throw error;
        }
    }

    async getAllContacts(): Promise<Contact[]> {
        try {
            const contacts = await this.db.all<Contact[]>(
                "SELECT id, email, names, subject, comment, country_ip, created_at FROM contacts ORDER BY created_at DESC"
            );
            console.log('Contactos recuperados:', contacts); // Debug
            return contacts;
        } catch (error) {
            console.error('Error al obtener contactos:', error);
            throw error;
        }
    }
}