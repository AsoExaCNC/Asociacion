// backend/src/routes/tablasBase.routes.js
const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/tablasBase.controller');

router.get('/:entity', getAll);
router.post('/:entity', create);
router.put('/:entity', update);
router.delete('/:entity', remove);

module.exports = router;