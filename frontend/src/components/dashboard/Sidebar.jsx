import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { LayoutDashboard, Menu as MenuIcon, QrCode, TrendingUp, LogOut, X } from 'lucide-react';

const Sidebar = () => {
  const { venue, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/dashboard/login');
  };

  const navItems = [
    { name: 'Pedidos', path: '/dashboard/orders', icon: <LayoutDashboard size={20} /> },
    { name: 'Menú', path: '/dashboard/menu', icon: <MenuIcon size={20} /> },
    { name: 'Mesas', path: '/dashboard/tables', icon: <QrCode size={20} /> },
    { name: 'Estadísticas', path: '/dashboard/stats', icon: <TrendingUp size={20} /> },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111] text-white">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold truncate tracking-tight">{venue?.name || 'Scan & Pay'}</h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Dashboard</p>
        </div>
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="sm:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                isActive 
                  ? 'bg-brand-red text-white' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Nav */}
      <div className="sm:hidden fixed top-0 w-full z-40 bg-[#111] border-b border-white/10 flex items-center p-4">
        <button onClick={() => setMobileOpen(true)} className="text-white">
          <MenuIcon size={24} />
        </button>
        <div className="ml-4 font-bold text-white tracking-tight">{venue?.name}</div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="sm:hidden fixed inset-0 z-40 bg-black/50" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
