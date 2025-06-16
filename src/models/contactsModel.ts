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
    ip?: string;
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
                // Si la tabla no existe, crearla con la estructura correcta
                console.log('Creando tabla contacts...');
                await this.db.exec(`
                    CREATE TABLE contacts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email TEXT NOT NULL,
                        names TEXT NOT NULL,
                        subject TEXT NOT NULL,
                        comment TEXT NOT NULL,
                        ip TEXT,
                        country TEXT,
                        created_at TEXT NOT NULL
                    )
                `);
                console.log('Tabla contacts creada exitosamente');
                return;
            }

            // Si la tabla existe, verificar su estructura
            const tableInfo = await this.db.all("PRAGMA table_info(contacts)");
            const columnNames = tableInfo.map(col => col.name);
            console.log('Columnas actuales:', columnNames);

            // Definir las columnas requeridas
            const requiredColumns = ['id', 'email', 'names', 'subject', 'comment', 'created_at'];
            const optionalColumns = ['ip', 'country'];
            
            // Verificar si todas las columnas requeridas existen
            const hasAllRequiredColumns = requiredColumns.every(col => columnNames.includes(col));
            const hasAllOptionalColumns = optionalColumns.every(col => columnNames.includes(col));

            if (!hasAllRequiredColumns || !hasAllOptionalColumns) {
                console.log('Estructura incorrecta detectada, recreando tabla...');
                
                // Crear tabla temporal con la estructura correcta
                await this.db.exec(`
                    CREATE TABLE contacts_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email TEXT NOT NULL,
                        names TEXT NOT NULL,
                        subject TEXT NOT NULL,
                        comment TEXT NOT NULL,
                        ip TEXT,
                        country TEXT,
                        created_at TEXT NOT NULL
                    )
                `);

                // Copiar solo las columnas que existen en ambas tablas
                const commonColumns = columnNames.filter(col => [...requiredColumns, ...optionalColumns].includes(col));
                if (commonColumns.length > 0) {
                    const columnsStr = commonColumns.join(', ');
                    await this.db.exec(`
                        INSERT INTO contacts_new (${columnsStr})
                        SELECT ${columnsStr}
                        FROM contacts
                    `);
                }

                // Eliminar tabla original y renombrar la nueva
                await this.db.exec(`
                    DROP TABLE contacts;
                    ALTER TABLE contacts_new RENAME TO contacts;
                `);
                
                console.log('Tabla recreada con la estructura correcta');
            }
        } catch (error) {
            console.error('Error al inicializar la base de datos:', error);
            throw error;
        }
    }

    async addContact(contact: Contact): Promise<void> {
        try {
            console.log('Guardando contacto:', contact);

            const stmt = await this.db.prepare(`
                INSERT INTO contacts (email, names, subject, comment, ip, country, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            
            const result = await stmt.run(
                contact.email,
                contact.names,
                contact.subject,
                contact.comment,
                contact.ip || null,
                contact.country || null,
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
                "SELECT id, email, names, subject, comment, ip, country, created_at FROM contacts ORDER BY created_at DESC"
            );
            console.log('Contactos recuperados:', contacts);
            return contacts;
        } catch (error) {
            console.error('Error al obtener contactos:', error);
            throw error;
        }
    }

    async deleteAllContacts(): Promise<void> {
        try {
            await this.db.run('DELETE FROM contacts');
            console.log('Todos los contactos han sido eliminados');
        } catch (error) {
            console.error('Error al eliminar contactos:', error);
            throw error;
        }
    }
}