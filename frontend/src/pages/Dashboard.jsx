import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SociosTable from '../components/SociosTable';
import SocioModal from '../components/SocioModal';
import CobrosManager from '../components/CobrosManager';

export default function Dashboard() {
  const { user, empresa, logoutSession } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('menu');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleOpenCreateModal = () => {
    setSelectedSocio(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (socio) => {
    setSelectedSocio(socio);
    setIsModalOpen(true);
  };

  const refreshSocios = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('menu')}>
            <h1 className="text-xl font-bold tracking-wide">ASO EXA CNC</h1>
            {empresa && (
              <span className="bg-blue-800 text-blue-200 text-xs px-3 py-1 rounded-full font-medium border border-blue-700">
                Sede: {empresa.nombre}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm font-semibold">{user?.nombre || 'Usuario'}</p>
              <p className="text-xs text-blue-200">{user?.email}</p>
            </div>
            <button
              onClick={() => { logoutSession(); navigate('/'); }}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded transition shadow"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab !== 'menu' && (
          <button
            onClick={() => setActiveTab('menu')}
            className="mb-4 text-sm font-bold text-blue-900 hover:underline flex items-center space-x-1"
          >
            ← Volver al Menú Principal
          </button>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-900">
              <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
              <p className="text-gray-600 text-sm mt-1">
                Selecciona un módulo para gestionar la sede <strong className="text-gray-800">{empresa?.nombre}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab('socios')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition cursor-pointer border border-gray-200 hover:border-blue-900 group"
              >
                <div className="text-blue-900 text-3xl font-bold mb-2 group-hover:scale-105 transition-transform">👥</div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-900">Gestión de Socios</h3>
                <p className="text-xs text-gray-500 mt-2">Registro, consulta y modificación de la nómina de socios.</p>
              </div>

              <div
                onClick={() => alert('Módulo de Aportes en construcción')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition cursor-pointer border border-gray-200 group"
              >
                <div className="text-green-600 text-3xl font-bold mb-2">💳</div>
                <h3 className="text-lg font-bold text-gray-800">Aportes y Cuotas</h3>
                <p className="text-xs text-gray-500 mt-2">Control de pagos e historial de ingresos.</p>
              </div>

              <div
                onClick={() => alert('Módulo de Reportes en construcción')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition cursor-pointer border border-gray-200 group"
              >
                <div className="text-purple-600 text-3xl font-bold mb-2">📊</div>
                <h3 className="text-lg font-bold text-gray-800">Reportes</h3>
                <p className="text-xs text-gray-500 mt-2">Estadísticas y padrón oficial.</p>
              </div>
              <div
              onClick={() => setActiveTab('tablasBase')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition cursor-pointer border border-gray-200 group"
            >
              <div className="text-orange-600 text-3xl font-bold mb-2">⚙️</div>
              <h3 className="text-lg font-bold text-gray-800">Tablas Base</h3>
              <p className="text-xs text-gray-500 mt-2">Mantenimiento de categorías, conceptos, países, tipos de socio y torneos.</p>
            </div>
            <div
  onClick={() => setActiveTab('cobros')}
  className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition cursor-pointer border border-gray-200 group"
>
  <div className="text-green-600 text-3xl font-bold mb-2">💳</div>
  <h3 className="text-lg font-bold text-gray-800">Caja / Ventanilla de Cobros</h3>
  <p className="text-xs text-gray-500 mt-2">Registro de cobros de Cuotas, Aportes, Inscripciones y Tarjetas.</p>
</div>
            </div>
          </div>
        )}

        {activeTab === 'socios' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleOpenCreateModal}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded shadow transition"
              >
                + Registrar Nuevo Socio
              </button>
            </div>

            <SociosTable key={reloadTrigger} onEditSocio={handleOpenEditModal} />
          </div>
        )}
        {activeTab === 'tablasBase' && <TablasBaseManager />}
        {activeTab === 'cobros' && <CobrosManager />}
      </main>

      <SocioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshSocios}
        socioToEdit={selectedSocio}
      />
    </div>
  );
}