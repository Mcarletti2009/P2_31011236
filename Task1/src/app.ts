import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../src/public')));

// Ruta principal
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});