// backend/src/controllers/cobros.controller.js
const db = require('../config/db');

// 1. Obtener conceptos según el origen (S = Socio, T = Torneo)
const getConceptosByOrigen = async (req, res) => {
  const { origen } = req.query; // 'S' o 'T'

  try {
    const query = `
      SELECT 
        c.concepid,
        TRIM(c.concepdes) AS concepdes,
        c.concepprio,
        TRIM(c.conceptipo) AS conceptipo,
        TRIM(c.concepcorto) AS concepcorto,
        TRIM(c.concepentidad) AS concepentidad,
        COALESCE(c1.concepmonto, 0) AS monto_actual
      FROM public.conceptos c
      LEFT JOIN public.conceptos1 c1 ON c.concepid = c1.concepid
        AND c1.concepfecha = (
          SELECT MAX(concepfecha) 
          FROM public.conceptos1 
          WHERE concepid = c.concepid
        )
      WHERE ($1::text IS NULL OR TRIM(c.concepentidad) = $1)
      ORDER BY c.concepprio ASC, c.concepdes ASC;
    `;

    const result = await db.query(query, [origen || null]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('--- ERROR GET CONCEPTOS ---', error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Registrar el cobro completo (Transacción: Cabecera + Detalles)
const createCobro = async (req, res) => {
  const client = await db.getClient();

  try {
    const {
      cobfecha,
      mcacod,
      concepid,
      cobentidad,   // 'SOCIO' o 'TORNEO'
      cobentidadid, // socioid o equipoid
      cobnrorecc,
      cobnropag,
      cobnrocheque,
      cobfeccheque,
      cobnrotarjeta,
      cobperiodo,
      cobrobservacion,
      cobvope,      // usucod
      detalles      // Array de items [{ concepid, periodo, fechaini, fechafin, monto }]
    } = req.body;

    if (!cobentidad || !cobentidadid || !mcacod || !concepid || !detalles || detalles.length === 0) {
      return res.status(400).json({ error: 'Datos de la transacción incompletos.' });
    }

    await client.query('BEGIN');

    // Calcular el importe total sumando los detalles
    const cobimporte = detalles.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);

    // Insertar Cabecera de Cobro
    const cobroQuery = `
      INSERT INTO public.cobros (
        cobfecha, cobfchvto, mcacod, concepid, cobentidad, cobentidadid,
        cobnrorecc, cobnropag, cobpagado, cobvfum, cobvope,
        cobnrocheque, cobfeccheque, cobnrotarjeta, cobimpsal, cobperiodo,
        cobimporte, cobrobservacion
      ) VALUES (
        $1, $1, $2, $3, $4, $5,
        $6, $7, 'S', NOW(), $8,
        $9, $10, $11, 0, $12,
        $13, $14
      ) RETURNING cobnro;
    `;

    const cobroValues = [
      cobfecha || new Date(),
      mcacod,
      concepid,
      cobentidad,
      cobentidadid,
      cobnrorecc || null,
      cobnropag || null,
      cobvope || 'ADMIN',
      cobnrocheque || null,
      cobfeccheque || null,
      cobnrotarjeta || null,
      cobperiodo || null,
      cobimporte,
      cobrobservacion || null
    ];

    const cobroRes = await client.query(cobroQuery, cobroValues);
    const cobnro = cobroRes.rows[0].cobnro;

    // Insertar Detalle de Cobros
    let detId = 1;
    for (const det of detalles) {
      const detQuery = `
        INSERT INTO public.cobrosdetalle (
          cobnro, cobdetid, cobdetconceptoid, cobdetperiodo,
          cobdetfechaini, cobdetfechafin, cobimpc, cobimpretc, cobtotal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $7);
      `;

      const detValues = [
        cobnro,
        detId++,
        det.concepid,
        det.periodo || cobperiodo || null,
        det.fechaini || cobfecha || new Date(),
        det.fechafin || cobfecha || new Date(),
        det.monto
      ];

      await client.query(detQuery, detValues);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Cobro registrado exitosamente', cobnro });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('--- ERROR AL REGISTRAR COBRO ---', error);
    res.status(500).json({ error: `Error en la transacción: ${error.message}` });
  } finally {
    client.release();
  }
};

module.exports = { getConceptosByOrigen, createCobro };