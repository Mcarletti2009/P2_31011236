import { Database } from 'sqlite3';
import bcrypt from 'bcrypt';

export interface User {
    id?: number;
    username: string;
    password_hash: string;
    github_id?: string;
    is_admin: boolean;
    created_at?: Date;
}

export class UserModel {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
        this.initTable();
    }

    private initTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password_hash TEXT,
                github_id TEXT UNIQUE,
                is_admin BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        this.db.run(sql);
    }

    async createUser(username: string, password: string, isAdmin: boolean = false): Promise<User> {
        const passwordHash = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)`;
            this.db.run(sql, [username, passwordHash, isAdmin], function(err) {
                if (err) reject(err);
                resolve({
                    id: this.lastID,
                    username,
                    password_hash: passwordHash,
                    is_admin: isAdmin
                });
            });
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE username = ?`;
            this.db.get(sql, [username], (err, row) => {
                if (err) reject(err);
                resolve(row as User || null);
            });
        });
    }

    async findByGithubId(githubId: string): Promise<User | null> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE github_id = ?`;
            this.db.get(sql, [githubId], (err, row) => {
                if (err) reject(err);
                resolve(row as User || null);
            });
        });
    }

    async findById(id: number): Promise<User | null> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE id = ?`;
            this.db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                resolve(row as User || null);
            });
        });
    }

    async verifyPassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.password_hash);
    }

    async createOrUpdateGithubUser(githubId: string, username: string): Promise<User> {
        const existingUser = await this.findByGithubId(githubId);
        if (existingUser) {
            return existingUser;
        }

        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (username, github_id, password_hash) VALUES (?, ?, ?)`;
            this.db.run(sql, [username, githubId, ''], function(err) {
                if (err) reject(err);
                resolve({
                    id: this.lastID,
                    username,
                    github_id: githubId,
                    password_hash: '',
                    is_admin: false
                });
            });
        });
    }
} 