// backend/src/controllers/socio.controller.js
const db = require('../config/db');

// 1. Obtener lista de socios
const getSociosByEmpresa = async (req, res) => {
  const { empid } = req.params;
  const { search } = req.query;

  try {
    let queryText = `
      SELECT 
        socioid,
        TRIM(socioci) AS socioci,
        TRIM(socionombre) AS socionombre,
        TRIM(socioapepri) AS socioapepri,
        TRIM(socioapeseg) AS socioapeseg,
        TRIM(socioapecas) AS socioapecas,
        TRIM(socionompri) AS socionompri,
        TRIM(socionomseg) AS socionomseg,
        TRIM(sociosexo) AS sociosexo,
        sociofchnac,
        TRIM(sociodomic) AS sociodomic,
        TRIM(sociotel) AS sociotel,
        sociofecing,
        sociomontocuota,
        sociomontoaporte,
        TRIM(socioestado) AS socioestado,
        TRIM(sociotipo) AS sociotipo,
        TRIM(sociocategoria) AS sociocategoria,
        empid
      FROM public.socio
      WHERE empid = $1
    `;

    const queryParams = [empid];

    if (search && search.trim() !== '') {
      queryText += ` AND (
        TRIM(socioci) ILIKE $2 OR 
        TRIM(socionombre) ILIKE $2 OR 
        TRIM(socioapepri) ILIKE $2 OR 
        TRIM(socionompri) ILIKE $2
      )`;
      queryParams.push(`%${search.trim()}%`);
    }

    queryText += ` ORDER BY socioid DESC LIMIT 100`;

    const result = await db.query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('--- ERROR AL OBTENER SOCIOS ---', error.message);
    res.status(500).json({ error: `Error del servidor: ${error.message}` });
  }
};

// 2. Crear Socio (Soporta NULL en socioapecas)
const createSocio = async (req, res) => {
  const {
    socioci,
    socionompri,
    socionomseg,
    socioapepri,
    socioapeseg,
    socioapecas,
    sociosexo,
    sociofchnac,
    sociodomic,
    sociotel,
    sociomontocuota,
    sociomontoaporte,
    sociocategoria,
    empid,
    usucod,
  } = req.body;

  try {
    if (!socioci || !socionompri || !socioapepri || !empid) {
      return res.status(400).json({ error: 'Cédula, primer nombre, primer apellido y empresa son obligatorios.' });
    }

    const socionombre = `${socioapepri} ${socioapeseg || ''} ${socionompri} ${socionomseg || ''}`.trim();

    const idResult = await db.query(`SELECT COALESCE(MAX(socioid), 0) + 1 AS next_id FROM public.socio`);
    const nextId = idResult.rows[0].next_id;

    // Solo si es mujer ('F') y tiene valor en socioapecas guardamos el string, si no NULL
    const socioapecasVal = (sociosexo === 'F' && socioapecas && socioapecas.trim() !== '') 
      ? socioapecas.trim() 
      : null;

    const queryText = `
      INSERT INTO public.socio (
        socioid, socioci, socionombre, socioapepri, socioapeseg, socioapecas,
        socionompri, socionomseg, sociosexo, sociofchnac, socioestciv,
        sociodomic, sociotel, sociofecing, sociomontocuota, sociomontoaporte,
        sociofecultapo, socioestado, sociotipo, socioperiodo, sociofecalta,
        sociousualta, sociofecmod, sociousumod, socioporcuo, sociofupcuo,
        sociocategoria, sociosueldo, empid
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, CURRENT_DATE, $14, $15,
        CURRENT_DATE, $16, $17, $18, NOW(),
        $19, NOW(), $20, $21, CURRENT_DATE,
        $22, $23, $24
      ) RETURNING socioid;
    `;

    const values = [
      nextId,
      socioci.trim(),
      socionombre,
      socioapepri.trim(),
      (socioapeseg || '').trim(),
      socioapecasVal, // Envía NULL si es masculino o no se ingresó
      socionompri.trim(),
      (socionomseg || '').trim(),
      sociosexo || 'M',
      sociofchnac || '2000-01-01',
      1,
      (sociodomic || '').trim(),
      (sociotel || '').trim(),
      sociomontocuota || 0,
      sociomontoaporte || 0,
      'AC',
      'ACTIVO',
      12,
      (usucod || 'ADMIN').substring(0, 15),
      (usucod || 'ADMIN').substring(0, 15),
      0,
      (sociocategoria || 'ACTIVO').trim(),
      0,
      empid
    ];

    await db.query(queryText, values);
    res.status(201).json({ message: 'Socio registrado con éxito', socioid: nextId });
  } catch (error) {
    console.error('--- ERROR AL CREAR SOCIO ---', error);
    res.status(500).json({ error: `Error en el servidor: ${error.message}` });
  }
};

// 3. Modificar Socio
const updateSocio = async (req, res) => {
  const { socioid } = req.params;
  const {
    socioci,
    socionompri,
    socionomseg,
    socioapepri,
    socioapeseg,
    socioapecas,
    sociosexo,
    sociofchnac,
    sociodomic,
    sociotel,
    sociomontocuota,
    sociomontoaporte,
    sociocategoria,
    socioestado,
    empid,
    usucod,
  } = req.body;

  try {
    const socionombre = `${socioapepri} ${socioapeseg || ''} ${socionompri} ${socionomseg || ''}`.trim();

    const socioapecasVal = (sociosexo === 'F' && socioapecas && socioapecas.trim() !== '') 
      ? socioapecas.trim() 
      : null;

    const queryText = `
      UPDATE public.socio SET
        socioci = $1,
        socionombre = $2,
        socioapepri = $3,
        socioapeseg = $4,
        socioapecas = $5,
        socionompri = $6,
        socionomseg = $7,
        sociosexo = $8,
        sociofchnac = $9,
        sociodomic = $10,
        sociotel = $11,
        sociomontocuota = $12,
        sociomontoaporte = $13,
        sociocategoria = $14,
        socioestado = $15,
        sociofecmod = NOW(),
        sociousumod = $16
      WHERE socioid = $17 AND empid = $18
    `;

    const values = [
      socioci.trim(),
      socionombre,
      socioapepri.trim(),
      (socioapeseg || '').trim(),
      socioapecasVal,
      socionompri.trim(),
      (socionomseg || '').trim(),
      sociosexo || 'M',
      sociofchnac || '2000-01-01',
      (sociodomic || '').trim(),
      (sociotel || '').trim(),
      sociomontocuota || 0,
      sociomontoaporte || 0,
      (sociocategoria || 'ACTIVO').trim(),
      socioestado || 'AC',
      (usucod || 'ADMIN').substring(0, 15),
      socioid,
      empid
    ];

    const result = await db.query(queryText, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Socio no encontrado o no pertenece a esta empresa.' });
    }

    res.status(200).json({ message: 'Socio actualizado exitosamente' });
  } catch (error) {
    console.error('--- ERROR AL ACTUALIZAR SOCIO ---', error);
    res.status(500).json({ error: `Error en el servidor: ${error.message}` });
  }
};

module.exports = {
  getSociosByEmpresa,
  createSocio,
  updateSocio,
};