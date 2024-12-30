import express from 'express';
import pkg from 'moment';
const { moment } = pkg;
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

// Configurar moment en español
if (moment) {
    moment.locale('es');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para habilitar CORS y parsear JSON y URL-encoded
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración del pool de conexiones a MySQL
const db = mysql.createPool({
  host: 'b5zhe2m18gxf4o21urv4-mysql.services.clever-cloud.com',
  user: 'umwur6ojkucomjv1',
  password: 'JZ6esKH4Zkkld5pUsYIv',
  database: 'b5zhe2m18gxf4o21urv4',
  connectionLimit: 10,  // Limita el número de conexiones
  charset: 'utf8mb4',   // Asegura compatibilidad con caracteres especiales
});

// Verificar la conexión cada cierto tiempo
setInterval(() => {
  db.query('SELECT 1', (err, results) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
    } else {
      console.log('Conexión a la base de datos activa');
    }
  });
}, 60000); // Cada 60 segundos

// Rutas de la API para manejar los recursos de la base de datos
const tables = ['Retrabajos', 'faltapersonal', 'faltamaterial', 'actividadesnuevas','oficios'];

tables.forEach((table) => {
  // Crear nuevo registro
  app.post(`/api/${table}`, (req, res) => {
    const query = `INSERT INTO ${table} SET ?`;
    db.query(query, req.body, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: result.insertId, ...req.body });
      }
    });
  });
  function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}
  // Obtener todos los registros
  app.get(`/api/${table}`, (req, res) => {
    const query = `SELECT * FROM ${table}`;
    db.query(query, (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(results);
      }
    });
  });

  // Obtener un solo registro por ID
  app.get(`/api/${table}/:id`, (req, res) => {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    db.query(query, [req.params.id], (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: 'Registro no encontrado' });
      } else {
        res.json(results[0]);
      }
    });
  });

  // Actualizar un registro
  app.put(`/api/${table}/:id`, (req, res) => {
    const query = `UPDATE ${table} SET ? WHERE id = ?`;
    db.query(query, [req.body, req.params.id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: req.params.id, ...req.body });
      }
    });
  });

  // Eliminar un registro
  app.delete(`/api/${table}/:id`, (req, res) => {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    db.query(query, [req.params.id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Registro eliminado con éxito' });
      }
    });
  });
});

// Rutas para servir los archivos HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'retrabajos.html'));  // Ruta principal por defecto
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  const validPages = ['retrabajos', 'faltapersonal', 'faltamaterial', 'actividadesnuevas', 'oficios'];
  if (validPages.includes(page)) {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  } else {
    res.status(404).send('Página no encontrada');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});
