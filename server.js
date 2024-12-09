import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = mysql.createConnection({
  host: 'b5zhe2m18gxf4o21urv4-mysql.services.clever-cloud.com',
  user: 'umwur6ojkucomjv1',
  password: 'JZ6esKH4Zkkld5pUsYIv',
  database: 'b5zhe2m18gxf4o21urv4'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

const tables = ['Retrabajos', 'faltapersonal', 'faltamaterial', 'actividadesnuevas', 'retrabajos'];

tables.forEach(table => {
  // Create
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

  // Read all
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

  // Read one
  app.get(`/api/${table}/:id`, (req, res) => {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    db.query(query, [req.params.id], (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: 'Record not found' });
      } else {
        res.json(results[0]);
      }
    });
  });

  // Update
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

  // Delete
  app.delete(`/api/${table}/:id`, (req, res) => {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    db.query(query, [req.params.id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'Record deleted successfully' });
      }
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:page', (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, 'public', `${page}.html`));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});