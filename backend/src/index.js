const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Declaración de rutas
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});

app.use('/api/socios', require('./routes/socio.routes'));

const tablasBaseRoutes = require('./routes/tablasBase.routes');
app.use('/api/tablas-base', tablasBaseRoutes);

const cobrosRoutes = require('./routes/cobros.routes');
app.use('/api/cobros', cobrosRoutes);