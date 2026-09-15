import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function SociosTable({ onEditSocio }) {
  const { empresa } = useContext(AuthContext);
  const [socios, setSocios] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSocios = async (searchTerm = '') => {
    if (!empresa?.id) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/socios/empresa/${empresa.id}`, {
        params: { search: searchTerm },
      });
      setSocios(response.data);
    } catch (err) {
      setError('Error al cargar la lista de socios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, [empresa]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchSocios(value);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Nómina de Socios</h3>
          <p className="text-sm text-gray-500">
            Sede activa: <strong className="text-gray-700">{empresa?.nombre}</strong>
          </p>
        </div>

        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por cédula, nombre o apellido..."
            value={search}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700 border-b">
              <th className="p-3 font-semibold">Cédula</th>
              <th className="p-3 font-semibold">Socio</th>
              <th className="p-3 font-semibold">Teléfono</th>
              <th className="p-3 font-semibold">Categoría</th>
              <th className="p-3 font-semibold text-right">Cuota</th>
              <th className="p-3 font-semibold text-center">Estado</th>
              <th className="p-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">Cargando socios...</td>
              </tr>
            ) : socios.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">No hay socios registrados.</td>
              </tr>
            ) : (
              socios.map((s) => (
                <tr key={s.socioid} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-900">{s.socioci}</td>
                  <td className="p-3 text-gray-800 font-medium">
                    {s.socioapepri} {s.socioapeseg} {s.socionompri}
                  </td>
                  <td className="p-3 text-gray-600">{s.sociotel || '-'}</td>
                  <td className="p-3 text-gray-600">{s.sociocategoria || '-'}</td>
                  <td className="p-3 text-right font-semibold text-gray-800">
                    Gs. {Number(s.sociomontocuota).toLocaleString('es-PY')}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${s.socioestado === 'AC' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {s.socioestado === 'AC' ? 'ACTIVO' : s.socioestado}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onEditSocio(s)}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded shadow"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}