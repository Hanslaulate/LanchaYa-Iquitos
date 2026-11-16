const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = process.env.DATA_PATH || process.env.DATABASE_PATH || path.join(dataDir, 'salidas.db');
const seedPath = path.join(dataDir, 'salidas.json');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS empresas (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 razonSocial TEXT NOT NULL,
 ruc TEXT NOT NULL UNIQUE,
 telefono TEXT NOT NULL,
 puertoBase TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS salidas (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 empresa TEXT NOT NULL,
 embarcacion TEXT NOT NULL,
 tipo TEXT NOT NULL,
 destino TEXT NOT NULL,
 puerto TEXT NOT NULL,
 fechaHora TEXT NOT NULL,
 duracionHoras REAL NOT NULL,
 precio REAL NOT NULL,
 cupos INTEGER NOT NULL,
 empresaId INTEGER REFERENCES empresas(id),
 estado TEXT NOT NULL DEFAULT 'programada'
);
CREATE TABLE IF NOT EXISTS reservas (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 salidaId INTEGER NOT NULL REFERENCES salidas(id) ON DELETE CASCADE,
 codigo TEXT NOT NULL UNIQUE,
 nombre TEXT NOT NULL,
 dni TEXT NOT NULL,
 telefono TEXT NOT NULL,
 cantidad INTEGER NOT NULL,
 createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);
function ensureColumn(table, name, definition) {
 const columns = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
 if (!columns.includes(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
}
ensureColumn('salidas', 'empresaId', 'INTEGER REFERENCES empresas(id)');
ensureColumn('salidas', 'estado', "TEXT NOT NULL DEFAULT 'programada'");

const total = db.prepare('SELECT COUNT(*) AS total FROM salidas').get().total;
if (!total && fs.existsSync(seedPath)) {
 const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
 const insert = db.prepare(`INSERT INTO salidas(id,empresa,embarcacion,tipo,destino,puerto,fechaHora,duracionHoras,precio,cupos,estado)
 VALUES(?,?,?,?,?,?,?,?,?,?,?)`);
 for (const r of rows) insert.run(r.id,r.empresa,r.embarcacion,r.tipo,r.destino,r.puerto,r.fechaHora,r.duracionHoras,r.precio,r.cupos,'programada');
}
module.exports = db;
