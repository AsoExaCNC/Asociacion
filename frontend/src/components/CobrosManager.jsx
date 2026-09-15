// frontend/src/components/CobrosManager.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function CobrosManager() {
  const { user, empresa } = useContext(AuthContext);

  const [origen, setOrigen] = useState('S'); // 'S' = Socio, 'T' = Torneo
  const [conceptos, setConceptos] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);
  
  // Datos Entidad
  const [searchEntidad, setSearchEntidad] = useState('');
  const [entidadSeleccionada, setEntidadSeleccionada] = useState(null);
  const [entidadesResult, setEntidadesResult] = useState([]);

  // Formulario Transacción
  const [mcacod, setMcacod] = useState('');
  const [cobfecha, setCobfecha] = useState(new Date().toISOString().substring(0, 10));
  const [cobrobservacion, setCobrobservacion] = useState('');
  const [numComprobante, setNumComprobante] = useState('');

  // Carrito / Detalle
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState('');
  const [montoItem, setMontoItem] = useState('');
  const [periodoItem, setPeriodoItem] = useState('');
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar conceptos y tipos de pago al cambiar pestaña
  useEffect(() => {
    fetchConceptos();
    fetchTiposPago();
    setEntidadSeleccionada(null);
    setDetalles([]);
  }, [origen]);

  const fetchConceptos = async () => {
    try {
      const res = await api.get(`/cobros/conceptos?origen=${origen}`);
      setConceptos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTiposPago = async () => {
    try {
      const res = await api.get('/tablas-base/tipmovcaja');
      setTiposPago(res.data);
      if (res.data.length > 0) setMcacod(res.data[0].mcacod.trim());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchEntidad = async (term) => {
    setSearchEntidad(term);
    if (!term || term.trim().length < 2) {
      setEntidadesResult([]);
      return;
    }

    try {
      if (origen === 'S') {
        const res = await api.get(`/socios/empresa/${empresa.id}`, { params: { search: term } });
        setEntidadesResult(res.data.map(s => ({
          id: s.socioid,
          nombre: `${s.socioapepri} ${s.socionompri} (${s.socioci})`
        })));
      } else {
        // Mock de búsqueda de Torneos / Equipos
        setEntidadesResult([
          { id: 101, nombre: 'Equipo Exa 2015' },
          { id: 102, nombre: 'Equipo Exa 2018' },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConcepto = (concepid) => {
    setConceptoSeleccionado(concepid);
    const conc = conceptos.find(c => c.concepid === Number(concepid));
    if (conc) {
      setMontoItem(conc.monto_actual || '');
    }
  };

  const handleAddItem = () => {
    if (!conceptoSeleccionado || !montoItem || Number(montoItem) <= 0) {
      alert('Selecciona un concepto e ingresa un monto válido.');
      return;
    }

    const conc = conceptos.find(c => c.concepid === Number(conceptoSeleccionado));
    setDetalles([
      ...detalles,
      {
        concepid: conc.concepid,
        descripcion: conc.concepdes,
        monto: Number(montoItem),
        periodo: periodoItem || null
      }
    ]);

    setConceptoSeleccionado('');
    setMontoItem('');
    setPeriodoItem('');
  };

  const handleRemoveItem = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const totalCobro = detalles.reduce((acc, curr) => acc + curr.monto, 0);

  const handleSubmitCobro = async (e) => {
    e.preventDefault();
    if (!entidadSeleccionada) return alert('Debes seleccionar un Socio o Torneo.');
    if (detalles.length === 0) return alert('Debes agregar al menos un concepto a la lista de cobro.');

    setLoading(true);
    try {
      const payload = {
        cobfecha,
        mcacod,
        concepid: detalles[0].concepid, // Concepto principal
        cobentidad: origen === 'S' ? 'SOCIO' : 'TORNEO',
        cobentidadid: entidadSeleccionada.id,
        cobnrorecc: numComprobante,
        cobvope: user?.id || 'ADMIN',
        cobrobservacion,
        detalles
      };

      const res = await api.post('/cobros', payload);
      alert(`¡Cobro N° ${res.data.cobnro} registrado exitosamente!`);
      
      // Limpieza
      setEntidadSeleccionada(null);
      setDetalles([]);
      setNumComprobante('');
      setCobrobservacion('');
    } catch (err) {
      alert('Error al registrar cobro: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botones de Selección del Modo de Cobro */}
      <div className="flex bg-white p-2 rounded-lg shadow space-x-2">
        <button
          onClick={() => setOrigen('S')}
          className={`flex-1 py-3 text-center font-bold text-sm rounded transition ${
            origen === 'S' ? 'bg-blue-900 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          👤 COBROS A SOCIOS (Cuotas, Aportes, Préstamos)
        </button>
        <button
          onClick={() => setOrigen('T')}
          className={`flex-1 py-3 text-center font-bold text-sm rounded transition ${
            origen === 'T' ? 'bg-orange-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🏆 COBROS DE TORNEO (Inscripción, Tarjetas, W.O.)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Selección y Configuración */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">
            1. {origen === 'S' ? 'Buscar Socio' : 'Buscar Torneo / Equipo'}
          </h3>

          {!entidadSeleccionada ? (
            <div className="relative">
              <input
                type="text"
                placeholder={origen === 'S' ? 'Buscar por CI, Nombre...' : 'Buscar Equipo...'}
                value={searchEntidad}
                onChange={(e) => handleSearchEntidad(e.target.value)}
                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
              {entidadesResult.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border rounded shadow-lg max-h-48 overflow-y-auto z-10 mt-1">
                  {entidadesResult.map((e) => (
                    <li
                      key={e.id}
                      onClick={() => { setEntidadSeleccionada(e); setEntidadesResult([]); setSearchEntidad(''); }}
                      className="p-2 text-sm hover:bg-blue-50 cursor-pointer border-b"
                    >
                      {e.nombre}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase">{origen === 'S' ? 'Socio Seleccionado' : 'Equipo'}</p>
                <p className="text-sm font-bold text-gray-800">{entidadSeleccionada.nombre}</p>
              </div>
              <button onClick={() => setEntidadSeleccionada(null)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                Cambiar
              </button>
            </div>
          )}

          <h3 className="font-bold text-gray-800 border-b pb-2 pt-2">2. Datos de Pago</h3>
          
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Medio de Pago</label>
            <select
              value={mcacod}
              onChange={(e) => setMcacod(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              {tiposPago.map((t) => (
                <option key={t.mcacod} value={t.mcacod.trim()}>
                  {t.mcadsc.trim()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Fecha</label>
            <input
              type="date"
              value={cobfecha}
              onChange={(e) => setCobfecha(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">N° Recibo / Comprobante</label>
            <input
              type="text"
              placeholder="Ej: REC-000123"
              value={numComprobante}
              onChange={(e) => setNumComprobante(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>

        {/* Panel Derecho: Selección de Conceptos y Detalle del Cobro */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow space-y-6">
          <h3 className="font-bold text-gray-800 border-b pb-2">3. Agregar Conceptos a Cobrar</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Concepto</label>
              <select
                value={conceptoSeleccionado}
                onChange={(e) => handleSelectConcepto(e.target.value)}
                className="w-full p-2 border rounded text-sm bg-white"
              >
                <option value="">-- Seleccionar --</option>
                {conceptos.map((c) => (
                  <option key={c.concepid} value={c.concepid}>
                    {c.concepdes}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Monto (Gs.)</label>
              <input
                type="number"
                value={montoItem}
                onChange={(e) => setMontoItem(e.target.value)}
                className="w-full p-2 border rounded text-sm bg-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded text-sm shadow"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* Grilla de Ítems */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b text-gray-700">
                  <th className="p-2 font-semibold">Concepto</th>
                  <th className="p-2 font-semibold text-right">Monto</th>
                  <th className="p-2 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-400">
                      No se han añadido ítems al cobro.
                    </td>
                  </tr>
                ) : (
                  detalles.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-medium">{item.descripcion}</td>
                      <td className="p-2 text-right font-semibold">Gs. {item.monto.toLocaleString('es-PY')}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-xs bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totalización */}
          <div className="flex justify-between items-center border-t pt-4">
            <div>
              <span className="text-sm font-bold text-gray-600">TOTAL A COBRAR:</span>
              <p className="text-2xl font-black text-blue-900">Gs. {totalCobro.toLocaleString('es-PY')}</p>
            </div>

            <button
              onClick={handleSubmitCobro}
              disabled={loading || detalles.length === 0}
              className={`px-6 py-3 rounded font-bold text-white shadow ${
                loading || detalles.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-900 hover:bg-blue-800'
              }`}
            >
              {loading ? 'Procesando...' : 'Confirmar y Registrar Cobro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}