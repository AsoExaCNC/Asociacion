const express = require('express');
const router = express.Router();
const { login, getEmpresasByUser } = require('../controllers/auth.controller');

router.post('/login', login);
router.get('/empresas/:email', getEmpresasByUser);

module.exports = router;