import sqlite3 from 'sqlite3';
import { UserModel } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

async function createInitialAdmin() {
    const db = new sqlite3.Database(process.env.DATABASE_URL || './database.sqlite');
    const userModel = new UserModel(db);

    try {
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

createInitialAdmin(); 