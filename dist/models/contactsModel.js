"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsModel = void 0;
class ContactsModel {
    constructor(db) {
        this.db = db;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Crea la tabla si no existe
            yield this.db.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        names TEXT,
        comment TEXT,
        ip TEXT,
        created_at TEXT
      );
    `);
        });
    }
    addContact(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, names, comment, ip, created_at } = contact;
            yield this.db.run(`INSERT INTO contacts (email, names, comment, ip, created_at) VALUES (?, ?, ?, ?, ?)`, [email, names, comment, ip, created_at]);
        });
    }
    getContacts() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.all(`SELECT * FROM contacts`);
        });
    }
}
exports.ContactsModel = ContactsModel;
