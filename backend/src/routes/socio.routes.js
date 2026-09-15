const express = require('express');
const router = express.Router();
const { getSociosByEmpresa, createSocio } = require('../controllers/socio.controller');

// Ruta GET para listar socios por empresa
router.get('/empresa/:empid', getSociosByEmpresa);

// Ruta POST para registrar un nuevo socio
router.post('/', createSocio);

module.exports = router;