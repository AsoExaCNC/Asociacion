import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Users, Settings } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  const { user, empresa, logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-slate-800">
          Exalumnos App
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded text-slate-300">
            <Home size={20} /> Dashboard
          </Link>
          <Link to="/exalumnos" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded text-slate-300">
            <Users size={20} /> Exalumnos
          </Link>
          <Link to="/configuracion" className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded text-slate-300">
            <Settings size={20} /> Configuración
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <div>
            <span className="font-semibold text-gray-700">{user?.nombre}</span>
            <span className="ml-3 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {empresa?.nombre}
            </span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium">
            <LogOut size={16} /> Salir
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}