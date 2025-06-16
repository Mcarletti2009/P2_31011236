import sqlite3 from 'sqlite3';
import { UserModel } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

export async function createInitialAdmin() {
    const db = new sqlite3.Database(process.env.DATABASE_URL || './database.sqlite');
    const userModel = new UserModel(db);

    try {
        // Verificar si ya existe un admin
        const existingAdmin = await userModel.findByUsername('admin');
        
        if (existingAdmin) {
            console.log('El usuario administrador ya existe');
            return;
        }

        // Crear usuario administrador
        const adminUser = await userModel.createUser(
            'admin',
            'admin123', // Cambia esto por una contraseña más segura
            true // isAdmin = true
        );
        console.log('Usuario administrador creado exitosamente:', adminUser);
    } catch (error) {
        console.error('Error al crear usuario administrador:', error);
    } finally {
        db.close();
    }
}

// Solo ejecutar si se llama directamente al script
if (require.main === module) {
    createInitialAdmin().catch(console.error);
} 