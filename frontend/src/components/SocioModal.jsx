import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function SocioModal({ isOpen, onClose, onSuccess, socioToEdit = null }) {
  const { empresa, user } = useContext(AuthContext);

  const initialForm = {
    socioci: '',
    socionompri: '',
    socionomseg: '',
    socioapepri: '',
    socioapeseg: '',
    socioapecas: '',
    sociosexo: 'M',
    sociofchnac: '2000-01-01',
    sociodomic: '',
    sociotel: '',
    sociomontocuota: '50000',
    sociomontoaporte: '100000',
    sociocategoria: 'ACTIVO',
    socioestado: 'AC',
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carga o limpia el formulario según socioToEdit cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (socioToEdit) {
        setFormData({
          socioci: socioToEdit.socioci ? String(socioToEdit.socioci).trim() : '',
          socionompri: socioToEdit.socionompri ? String(socioToEdit.socionompri).trim() : '',
          socionomseg: socioToEdit.socionomseg ? String(socioToEdit.socionomseg).trim() : '',
          socioapepri: socioToEdit.socioapepri ? String(socioToEdit.socioapepri).trim() : '',
          socioapeseg: socioToEdit.socioapeseg ? String(socioToEdit.socioapeseg).trim() : '',
          socioapecas: socioToEdit.socioapecas ? String(socioToEdit.socioapecas).trim() : '',
          sociosexo: socioToEdit.sociosexo ? String(socioToEdit.sociosexo).trim() : 'M',
          sociofchnac: socioToEdit.sociofchnac ? String(socioToEdit.sociofchnac).substring(0, 10) : '2000-01-01',
          sociodomic: socioToEdit.sociodomic ? String(socioToEdit.sociodomic).trim() : '',
          sociotel: socioToEdit.sociotel ? String(socioToEdit.sociotel).trim() : '',
          sociomontocuota: socioToEdit.sociomontocuota || '0',
          sociomontoaporte: socioToEdit.sociomontoaporte || '0',
          sociocategoria: socioToEdit.sociocategoria ? String(socioToEdit.sociocategoria).trim() : 'ACTIVO',
          socioestado: socioToEdit.socioestado ? String(socioToEdit.socioestado).trim() : 'AC',
        });
      } else {
        setFormData(initialForm);
      }
      setError('');
    }
  }, [isOpen, socioToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sociosexo' && value === 'M') {
      setFormData({ ...formData, sociosexo: 'M', socioapecas: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      empid: empresa.id,
      usucod: user?.id || 'ADMIN',
    };

    try {
      if (socioToEdit) {
        await api.put(`/socios/${socioToEdit.socioid}`, payload);
      } else {
        await api.post('/socios', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold text-gray-800">
            {socioToEdit ? `Editar Socio (ID: ${socioToEdit.socioid})` : 'Registrar Nuevo Socio'}
          </h3>
          <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded">
            Sede: {empresa?.nombre}
          </span>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">N° Cédula *</label>
              <input
                type="text"
                name="socioci"
                required
                value={formData.socioci}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría</label>
              <select
                name="sociocategoria"
                value={formData.sociocategoria}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="HONORARIO">HONORARIO</option>
                <option value="FUNDADOR">FUNDADOR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primer Nombre *</label>
              <input
                type="text"
                name="socionompri"
                required
                value={formData.socionompri}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Segundo Nombre</label>
              <input
                type="text"
                name="socionomseg"
                value={formData.socionomseg}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Primer Apellido *</label>
              <input
                type="text"
                name="socioapepri"
                required
                value={formData.socioapepri}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Segundo Apellido</label>
              <input
                type="text"
                name="socioapeseg"
                value={formData.socioapeseg}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sexo *</label>
              <select
                name="sociosexo"
                value={formData.sociosexo}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            {formData.sociosexo === 'F' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Apellido Casada</label>
                <input
                  type="text"
                  name="socioapecas"
                  value={formData.socioapecas}
                  onChange={handleChange}
                  placeholder="Ej: De López"
                  className="w-full p-2 border border-pink-300 bg-pink-50 rounded text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha Nacimiento</label>
              <input
                type="date"
                name="sociofchnac"
                value={formData.sociofchnac}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Teléfono</label>
              <input
                type="text"
                name="sociotel"
                value={formData.sociotel}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Domicilio</label>
              <input
                type="text"
                name="sociodomic"
                value={formData.sociodomic}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Monto Cuota (Gs.)</label>
              <input
                type="number"
                name="sociomontocuota"
                value={formData.sociomontocuota}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Monto Aporte (Gs.)</label>
              <input
                type="number"
                name="sociomontoaporte"
                value={formData.sociomontoaporte}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              />
            </div>

            {socioToEdit && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estado</label>
                <select
                  name="socioestado"
                  value={formData.socioestado}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="AC">ACTIVO</option>
                  <option value="IN">INACTIVO</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-blue-900 rounded hover:bg-blue-800 font-bold"
            >
              {loading ? 'Guardando...' : socioToEdit ? 'Actualizar Socio' : 'Guardar Socio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}