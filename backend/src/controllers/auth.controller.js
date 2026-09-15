const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password, empresa_id } = req.body;

  try {
    if (!email || !password || !empresa_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // 1. Consultar usuario eliminando espacios adicionales en la BD con TRIM()
    const userResult = await db.query(
      `SELECT 
         TRIM(usucod) AS usucod, 
         TRIM(usunombre) AS usunombre, 
         TRIM(usupass) AS usupass, 
         TRIM(usuemail) AS usuemail, 
         empid 
       FROM public.usuario 
       WHERE TRIM(usuemail) ILIKE TRIM($1) AND empid = $2`,
      [email, empresa_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o sin acceso a la empresa.' });
    }

    const user = userResult.rows[0];

    // Limpiamos espacios sobrantes de los valores
    const passEnBD = user.usupass ? user.usupass.trim() : '';
    const passIngresada = password.trim();

    // 2. Verificación de Contraseña (Bcrypt o Texto Plano limpia)
    let isMatch = false;

    if (passEnBD.startsWith('$2a$') || passEnBD.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(passIngresada, passEnBD);
    } else {
      isMatch = (passEnBD === passIngresada);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 3. Obtener datos de la empresa
    const empresaResult = await db.query(
      `SELECT empid, TRIM(empnom) AS empnom 
       FROM public.empresa 
       WHERE empid = $1`,
      [empresa_id]
    );

    if (empresaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada.' });
    }

    const empresa = empresaResult.rows[0];
    const secretKey = process.env.JWT_SECRET || 'secreto_desarrollo_123';

    // 4. Generar Token JWT
    const token = jwt.sign(
      {
        userId: user.usucod,
        email: user.usuemail,
        empresaId: empresa.empid,
      },
      secretKey,
      { expiresIn: '8h' }
    );

    // 5. Respuesta exitosa
    res.status(200).json({
      token,
      user: {
        id: user.usucod,
        nombre: user.usunombre,
        email: user.usuemail,
      },
      empresa: {
        id: empresa.empid,
        nombre: empresa.empnom,
      },
    });
  } catch (error) {
    console.error('--- ERROR EN LOGIN ---', error);
    res.status(500).json({ error: `Error del servidor: ${error.message}` });
  }
};

const getEmpresasByUser = async (req, res) => {
  const { email } = req.params;

  try {
    console.log('--- BUSCANDO EMPRESAS PARA EMAIL ---:', email);

    // Consulta en minúsculas puras
    const result = await db.query(
      `SELECT DISTINCT e.empid, e.empnom 
       FROM public.empresa e 
       INNER JOIN public.usuario u ON e.empid = u.empid 
       WHERE TRIM(u.usuemail) ILIKE TRIM($1)`,
      [email]
    );

    console.log('--- EMPRESAS ENCONTRADAS ---:', result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('--- ERROR DETALLADO EN GET EMPRESAS ---:', error);
    // Enviamos el mensaje exacto para evitar mensajes genéricos
    res.status(500).json({ error: error.message });
  }
};
module.exports = { login, getEmpresasByUser };