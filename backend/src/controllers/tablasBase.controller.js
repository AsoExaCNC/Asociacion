// backend/src/controllers/tablasBase.controller.js
const db = require('../config/db');

// Definición de metadatos de las tablas base
const TABLES_CONFIG = {
  categoria: { table: 'public.categoria', pks: ['categoriaid'] },
  conceptos: { table: 'public.conceptos', pks: ['concepid'], autoPk: true },
  etapas: { table: 'public.etapas', pks: ['etapacod'] },
  pais: { table: 'public.pais', pks: ['paisid'] },
  tipmovcaja: { table: 'public.tipmovcaja', pks: ['mcacod'] },
  tiposocio: { table: 'public.tiposocio', pks: ['tipocod'] },
  tipotorneo: { table: 'public.tipotorneo', pks: ['ttcodigo'] },
  conceptos1: { table: 'public.conceptos1', pks: ['concepid', 'concepfecha'] },
  divisiones: { table: 'public.divisiones', pks: ['ligaid', 'temporadaid', 'divisionesid'] },
};

// 1. Obtener todos los registros de una tabla
const getAll = async (req, res) => {
  const { entity } = req.params;
  const config = TABLES_CONFIG[entity];

  if (!config) return res.status(400).json({ error: 'Entidad no soportada' });

  try {
    const result = await db.query(`SELECT * FROM ${config.table} ORDER BY ${config.pks[0]} DESC LIMIT 200`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(`--- ERROR GET ${entity} ---`, error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Crear nuevo registro
const create = async (req, res) => {
  const { entity } = req.params;
  const config = TABLES_CONFIG[entity];
  const data = req.body;

  if (!config) return res.status(400).json({ error: 'Entidad no soportada' });

  try {
    const keys = Object.keys(data).filter((k) => !(config.autoPk && config.pks.includes(k)));
    const values = keys.map((k) => (data[k] !== undefined && data[k] !== '' ? data[k] : null));
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${config.table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`--- ERROR POST ${entity} ---`, error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Modificar registro existente
const update = async (req, res) => {
  const { entity } = req.params;
  const config = TABLES_CONFIG[entity];
  const data = req.body;

  if (!config) return res.status(400).json({ error: 'Entidad no soportada' });

  try {
    const pks = config.pks;
    const updateKeys = Object.keys(data).filter((k) => !pks.includes(k));

    const setClause = updateKeys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const updateValues = updateKeys.map((k) => (data[k] !== undefined && data[k] !== '' ? data[k] : null));

    let paramIndex = updateKeys.length + 1;
    const whereClause = pks.map((pk) => `${pk} = $${paramIndex++}`).join(' AND ');
    const pkValues = pks.map((pk) => req.query[pk] || data[pk]);

    const query = `
      UPDATE ${config.table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *;
    `;

    const result = await db.query(query, [...updateValues, ...pkValues]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`--- ERROR PUT ${entity} ---`, error);
    res.status(500).json({ error: error.message });
  }
};

// 4. Eliminar registro
const remove = async (req, res) => {
  const { entity } = req.params;
  const config = TABLES_CONFIG[entity];

  if (!config) return res.status(400).json({ error: 'Entidad no soportada' });

  try {
    const pks = config.pks;
    let paramIndex = 1;
    const whereClause = pks.map((pk) => `${pk} = $${paramIndex++}`).join(' AND ');
    const pkValues = pks.map((pk) => req.query[pk]);

    const query = `DELETE FROM ${config.table} WHERE ${whereClause}`;
    await db.query(query, pkValues);

    res.status(200).json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error(`--- ERROR DELETE ${entity} ---`, error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, create, update, remove };