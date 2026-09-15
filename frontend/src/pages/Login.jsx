import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import logoAso from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState('');
  const [error, setError] = useState('');

  const { loginSession } = useContext(AuthContext);
  const navigate = useNavigate();

const handleBlurEmail = async () => {
  if (!email) return;
  setError(''); // Limpiar errores previos
  try {
    const response = await api.get(`/auth/empresas/${email.trim()}`);
    setEmpresas(response.data);
    
    if (response.data.length > 0) {
      // Garantizar que tome el valor de la clave en minúsculas
      setSelectedEmpresa(response.data[0].empid);
    } else {
      setSelectedEmpresa('');
      setError('No se encontraron empresas asociadas a este correo.');
    }
  } catch (err) {
    setError('Error al consultar empresas asociadas.');
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        empresa_id: selectedEmpresa,
      });
      loginSession(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        {/* 2. Renderizas la imagen aquí */}
        <div className="flex justify-center mb-4">
          <img 
            src={logoAso} 
            alt="Logo ASO EXA CNC" 
            className="w-24 h-24 object-contain" 
          />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">ASO EXA CNC</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Usuario / Correo Electrónico</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleBlurEmail}
            className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Empresa / Sede</label>
          <select
            value={selectedEmpresa}
            onChange={(e) => setSelectedEmpresa(e.target.value)}
            disabled={empresas.length === 0}
            className="w-full p-2 border border-gray-300 rounded mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {empresas.length === 0 && <option value="">Ingrese su email para cargar sedes</option>}
            {empresas.map((emp) => (
              <option key={emp.empid} value={emp.empid}>{emp.empnom}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}