// backend/src/routes/cobros.routes.js
const express = require('express');
const router = express.Router();
const { getConceptosByOrigen, createCobro } = require('../controllers/cobros.controller');

router.get('/conceptos', getConceptosByOrigen);
router.post('/', createCobro);

module.exports = router;